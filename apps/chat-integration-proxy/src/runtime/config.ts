// The only file in `src/` allowed to read `process.env` (design.md's File
// Structure Plan: "process.env を読んでよい唯一のファイル"). `runtime/` is the
// outermost layer, so nothing imports it back and no inner layer ever learns
// where a value came from.
//
// Two invariants shape what this module hands out:
//
//  - **The storage-encryption key never leaves this file.** Other layers get a
//    `SecretCipher` -- functions -- rather than the key or a decrypted value
//    (design.md, Data Models: "暗号化に使う鍵は `runtime/config.ts` が環境変数
//    から読み、他の層へは復号済みの値ではなく復号する関数を渡す").
//  - **Missing or malformed key means the process does not start.** Falling
//    back to storing `installation.credentials` / `own_key.private_key_pem` in
//    the clear is the outcome this refusal exists to prevent.

import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';

import type { PlatformAppConfig, SecretCipher } from '../types/index.js';

// Re-exported so `runtime/index.ts` -- and anything reading this module as the
// place storage encryption is configured -- still names the type here, while
// `types/secret-cipher.ts` stays its single declaration (see that file for why
// the declaration cannot live in `runtime/`).
export type { SecretCipher } from '../types/index.js';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

/**
 * The operator's closed-network declaration (Requirement 13.1). `allowList`
 * goes to `judgeGrowiUri`'s third argument verbatim; `trustedCaCertsFor`
 * answers "what certificate authority do we trust when connecting to this
 * host", which the networking layer feeds to its TLS options. Without the
 * second half, the only working closed-network configuration would be turning
 * certificate verification off altogether (design.md, 閉域 section).
 */
export interface ClosedNetworkConfig {
  /** Hostnames, already normalised the way `judgeGrowiUri` normalises them. */
  readonly allowList: ReadonlyArray<string>;
  /** PEM certificates to trust for that hostname; empty when none was declared. */
  readonly trustedCaCertsFor: (hostname: string) => ReadonlyArray<string>;
}

export interface ProxyConfig {
  readonly platformApp: PlatformAppConfig;
  readonly closedNetwork: ClosedNetworkConfig;
  readonly cipher: SecretCipher;
}

// ---------------------------------------------------------------------------
// Reading required / optional values
// ---------------------------------------------------------------------------

class ConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigurationError';
  }
}

const read = (env: NodeJS.ProcessEnv, name: string): string | undefined => {
  const value = env[name];
  return value == null || value === '' ? undefined : value;
};

const requireValue = (env: NodeJS.ProcessEnv, name: string): string => {
  const value = read(env, name);
  if (value == null) {
    throw new ConfigurationError(
      `${name} is not set. The chat-integration proxy refuses to start without it.`,
    );
  }
  return value;
};

/**
 * A service is configured as a whole or not at all. Reading a half-filled set
 * would start the process with a connection that cannot be opened, so the
 * missing names are reported instead -- names only, never the values that were
 * found.
 */
const readServiceSection = <T>(
  env: NodeJS.ProcessEnv,
  serviceName: string,
  names: Readonly<Record<keyof T & string, string>>,
  build: (values: Record<string, string>) => T,
): T | undefined => {
  const entries = Object.entries(names) as ReadonlyArray<[string, string]>;
  const present = entries.filter(([, envName]) => read(env, envName) != null);
  if (present.length === 0) {
    return undefined;
  }

  const missing = entries
    .filter(([, envName]) => read(env, envName) == null)
    .map(([, envName]) => envName);
  if (missing.length > 0) {
    throw new ConfigurationError(
      `${serviceName} is partially configured: ${missing.join(', ')} ${
        missing.length === 1 ? 'is' : 'are'
      } not set. Set every variable for a service, or none of them.`,
    );
  }

  return build(
    Object.fromEntries(
      entries.map(([field, envName]) => [field, requireValue(env, envName)]),
    ),
  );
};

const readPlatformAppConfig = (env: NodeJS.ProcessEnv): PlatformAppConfig => ({
  slack: readServiceSection(
    env,
    'Slack',
    {
      signingSecret: 'SLACK_SIGNING_SECRET',
      clientId: 'SLACK_CLIENT_ID',
      clientSecret: 'SLACK_CLIENT_SECRET',
      appToken: 'SLACK_APP_TOKEN',
    },
    (v) => ({
      signingSecret: v.signingSecret,
      clientId: v.clientId,
      clientSecret: v.clientSecret,
      appToken: v.appToken,
    }),
  ),
  discord: readServiceSection(
    env,
    'Discord',
    {
      applicationId: 'DISCORD_APPLICATION_ID',
      publicKey: 'DISCORD_PUBLIC_KEY',
      clientSecret: 'DISCORD_CLIENT_SECRET',
      botToken: 'DISCORD_BOT_TOKEN',
    },
    (v) => ({
      applicationId: v.applicationId,
      publicKey: v.publicKey,
      clientSecret: v.clientSecret,
      botToken: v.botToken,
    }),
  ),
  teams: readServiceSection(
    env,
    'Microsoft Teams',
    { clientId: 'TEAMS_CLIENT_ID', clientSecret: 'TEAMS_CLIENT_SECRET' },
    (v) => ({ clientId: v.clientId, clientSecret: v.clientSecret }),
  ),
  // Deliberately CHAT_SDK_DATABASE_URL and not DATABASE_URL: the Chat SDK's
  // `createPostgresState()` auto-detects DATABASE_URL / POSTGRES_URL, which
  // would collide with this app's own Prisma connection (see .env.development).
  stateConnectionString: requireValue(env, 'CHAT_SDK_DATABASE_URL'),
});

// ---------------------------------------------------------------------------
// Storage encryption (AES-256-GCM)
// ---------------------------------------------------------------------------

const KEY_ENV_NAME = 'SECRET_ENCRYPTION_KEY';
const KEY_LENGTH_BYTES = 32;
const IV_LENGTH_BYTES = 12;
const AUTH_TAG_LENGTH_BYTES = 16;
/** Stored as a prefix so a future algorithm change can be told apart on read. */
const CIPHERTEXT_PREFIX = 'v1:';

const readEncryptionKey = (env: NodeJS.ProcessEnv): Buffer => {
  const configured = read(env, KEY_ENV_NAME);
  if (configured == null) {
    throw new ConfigurationError(
      `${KEY_ENV_NAME} is not set. It encrypts stored credentials and private keys, so the proxy refuses to start rather than write them in the clear. Expected ${KEY_LENGTH_BYTES} random bytes, base64-encoded.`,
    );
  }

  // `Buffer.from(..., 'base64')` ignores what it cannot read instead of
  // failing, so the decoded length is the check that matters. The configured
  // value itself is never repeated back -- only its length.
  const key = Buffer.from(configured, 'base64');
  if (key.length !== KEY_LENGTH_BYTES) {
    throw new ConfigurationError(
      `${KEY_ENV_NAME} decodes to ${key.length} bytes, but AES-256-GCM needs exactly ${KEY_LENGTH_BYTES}. Generate one with: openssl rand -base64 ${KEY_LENGTH_BYTES}`,
    );
  }
  return key;
};

/**
 * AES-256-GCM rather than AES-256-CBC: the two columns this protects
 * (`installation.credentials`, `own_key.private_key_pem`) are read back and
 * used to act on someone's behalf, so the read has to fail on a row that was
 * altered in the database. GCM authenticates the ciphertext, an unauthenticated
 * mode does not. A fresh random IV per call means the same token stored twice
 * does not produce the same stored bytes.
 */
const buildCipher = (key: Buffer): SecretCipher => ({
  encrypt: (plaintext: string): string => {
    const iv = randomBytes(IV_LENGTH_BYTES);
    const cipher = createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([
      cipher.update(plaintext, 'utf8'),
      cipher.final(),
    ]);
    return (
      CIPHERTEXT_PREFIX +
      Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString('base64')
    );
  },

  decrypt: (ciphertext: string): string => {
    if (!ciphertext.startsWith(CIPHERTEXT_PREFIX)) {
      throw new Error(
        'Stored value is not in the encrypted form this proxy writes.',
      );
    }
    const raw = Buffer.from(
      ciphertext.slice(CIPHERTEXT_PREFIX.length),
      'base64',
    );
    if (raw.length < IV_LENGTH_BYTES + AUTH_TAG_LENGTH_BYTES) {
      throw new Error('Stored value is too short to be an encrypted value.');
    }

    const iv = raw.subarray(0, IV_LENGTH_BYTES);
    const authTag = raw.subarray(
      IV_LENGTH_BYTES,
      IV_LENGTH_BYTES + AUTH_TAG_LENGTH_BYTES,
    );
    const encrypted = raw.subarray(IV_LENGTH_BYTES + AUTH_TAG_LENGTH_BYTES);

    const decipher = createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);
    // `final()` throws when the authentication tag does not match, which is
    // how an altered row or a value written under another key is refused.
    return Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]).toString('utf8');
  },
});

// ---------------------------------------------------------------------------
// Closed-network destinations
// ---------------------------------------------------------------------------

const DESTINATIONS_ENV_NAME = 'GROWI_ALLOWED_DESTINATIONS';

interface DeclaredDestination {
  readonly hostname: string;
  readonly caCertPath?: string;
}

/**
 * Same normalisation `judgeGrowiUri` applies to the hostname it judges: an
 * entry that does not survive this untouched would never match anything.
 */
const normalizeHostname = (hostname: string): string => {
  const withoutBrackets =
    hostname.startsWith('[') && hostname.endsWith(']')
      ? hostname.slice(1, -1)
      : hostname;
  const lowered = withoutBrackets.toLowerCase();
  return lowered.endsWith('.') ? lowered.slice(0, -1) : lowered;
};

/**
 * `judgeGrowiUri` matches an allow-list entry against a bare hostname. An
 * operator who writes a whole URL (`https://growi.internal:3000/`) would get an
 * entry that silently matches nothing and a pairing that is refused with no
 * explanation, so the shape is checked here instead.
 */
const assertBareHostname = (hostname: string, raw: string): void => {
  const looksLikeUrl =
    hostname.includes('/') || hostname.includes('@') || hostname.includes('?');
  // A colon is only allowed inside an IPv6 literal, which the operator writes
  // in brackets; anywhere else it is a port.
  const carriesPort =
    hostname.includes(':') && !(raw.startsWith('[') && raw.endsWith(']'));
  if (hostname === '' || looksLikeUrl || carriesPort) {
    throw new ConfigurationError(
      `${DESTINATIONS_ENV_NAME} contains "${raw}", which is not a bare hostname. Write the host alone (growi.internal, or [fd00::1] for an IPv6 literal) -- no scheme, port or path, because that is what the destination is matched by.`,
    );
  }
};

const readCaCert = (caCertPath: string): string => {
  let pem: string;
  try {
    pem = readFileSync(caCertPath, 'utf8');
  } catch (error) {
    throw new ConfigurationError(
      `${DESTINATIONS_ENV_NAME} names a certificate at ${caCertPath} that cannot be read: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
  if (!pem.includes('BEGIN CERTIFICATE')) {
    throw new ConfigurationError(
      `The file at ${caCertPath} holds no PEM certificate (no "BEGIN CERTIFICATE" line).`,
    );
  }
  return pem;
};

const parseDeclaredDestinations = (
  rawJson: string,
): ReadonlyArray<DeclaredDestination> => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJson);
  } catch (error) {
    throw new ConfigurationError(
      `${DESTINATIONS_ENV_NAME} is not readable as JSON: ${
        error instanceof Error ? error.message : String(error)
      }. Expected a list such as [{"hostname":"growi.internal","caCertPath":"/etc/ssl/internal-ca.pem"}].`,
    );
  }
  if (!Array.isArray(parsed)) {
    throw new ConfigurationError(
      `${DESTINATIONS_ENV_NAME} must be a JSON list of destinations, such as [{"hostname":"growi.internal"}].`,
    );
  }

  return parsed.map((entry) => {
    if (
      typeof entry !== 'object' ||
      entry == null ||
      typeof (entry as { hostname?: unknown }).hostname !== 'string'
    ) {
      throw new ConfigurationError(
        `Every entry of ${DESTINATIONS_ENV_NAME} needs a "hostname" written as text, such as {"hostname":"growi.internal"}.`,
      );
    }
    const { hostname, caCertPath } = entry as {
      hostname: string;
      caCertPath?: unknown;
    };
    if (caCertPath != null && typeof caCertPath !== 'string') {
      throw new ConfigurationError(
        `"caCertPath" of ${DESTINATIONS_ENV_NAME} entry "${hostname}" must be a path written as text.`,
      );
    }
    return { hostname, caCertPath: caCertPath ?? undefined };
  });
};

const readClosedNetworkConfig = (
  env: NodeJS.ProcessEnv,
): ClosedNetworkConfig => {
  const rawJson = read(env, DESTINATIONS_ENV_NAME);
  const declared = rawJson == null ? [] : parseDeclaredDestinations(rawJson);

  // The certificates are read now rather than at the first request, so a wrong
  // path is a startup failure the operator sees, not a pairing that fails much
  // later for a reason that looks unrelated.
  const certsByHostname = new Map<string, string[]>();
  const allowList: string[] = [];
  for (const { hostname, caCertPath } of declared) {
    const normalized = normalizeHostname(hostname);
    assertBareHostname(normalized, hostname);
    if (!allowList.includes(normalized)) {
      allowList.push(normalized);
    }
    if (caCertPath != null) {
      const certs = certsByHostname.get(normalized) ?? [];
      certs.push(readCaCert(caCertPath));
      certsByHostname.set(normalized, certs);
    }
  }

  return {
    allowList,
    trustedCaCertsFor: (hostname: string): ReadonlyArray<string> =>
      certsByHostname.get(normalizeHostname(hostname)) ?? [],
  };
};

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

/**
 * Reads every value the proxy needs and refuses to start when a required one is
 * missing or malformed. `env` is a parameter so tests (and any future caller
 * with its own source of values) never have to write to `process.env`; the
 * default is the only place the real environment is read.
 */
export const loadConfig = (
  env: NodeJS.ProcessEnv = process.env,
): ProxyConfig => {
  const cipher = buildCipher(readEncryptionKey(env));
  return {
    platformApp: readPlatformAppConfig(env),
    closedNetwork: readClosedNetworkConfig(env),
    cipher,
  };
};
