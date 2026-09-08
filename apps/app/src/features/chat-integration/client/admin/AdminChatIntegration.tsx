// Task 9.1's admin screen: shows every relation this GROWI has paired with,
// what each connected service can actually do (Requirement 1.3), each
// active relation's live connection health (Requirement 1.4), and lets an
// administrator start a new pairing -- unless the encryption key this
// feature needs to store a private key is not configured (design.md
// "秘密鍵の暗号化...未設定ならペアリングを始められない").
//
// Follows this feature's own client convention (see `MyChatAccountLinks.tsx`
// and `AccountLinkApproval.tsx`): plain hooks + `~/client/util/apiv3-client`
// directly, no `~/stores/*` entry, English-first UI text (translation is a
// separate, later task -- this feature's own precedent already ships this
// way, and blocking a brand-new admin screen on i18n key authoring would
// gate a working feature on unrelated work).
//
// CRITICAL: the "what can this service do" section renders `CapabilityReport`
// GENERICALLY -- it iterates `report.platforms[].capabilities[]` and prints
// whatever fields come back, with no per-platform or per-capability branch.
// Do NOT add a switch/if that special-cases a capability name or platform
// here: the proxy is the single source of truth for what each service can
// do (task 9.1's own warning against deciding this independently).

import { type JSX, useCallback, useId, useState } from 'react';
import type { CapabilityReport, ConnectionStatusView } from '@growi/chat';
import useSWR from 'swr';

import { apiv3Get, apiv3Post } from '~/client/util/apiv3-client';
import { toastError, toastSuccess } from '~/client/util/toastr';

// ============================================================================
// Types
// ============================================================================

interface EncryptionStatus {
  readonly configured: boolean;
  readonly reason?: 'unset' | 'invalid-key' | 'invalid-generation';
}

interface AdminRelationListItem {
  readonly relationId: string;
  readonly platform: string;
  readonly workspaceId: string;
  readonly workspaceName: string;
  readonly label: string | null;
  readonly state: 'active' | 'unpaired';
  readonly createdAt: string;
  readonly unpairedAt: string | null;
}

type PairingOutcome =
  | { readonly status: 'paired'; readonly relationId: string }
  | { readonly status: 'relation-already-known'; readonly relationId: string }
  | { readonly status: 'already-paired'; readonly detail: string }
  | { readonly status: 'code-expired' }
  | { readonly status: 'ownership-unverified'; readonly detail: string }
  | { readonly status: 'call-failed'; readonly reason: string }
  | { readonly status: 'key-encryption-unconfigured' };

// ============================================================================
// Fetchers
// ============================================================================

const fetchEncryptionStatus = async (): Promise<EncryptionStatus> => {
  const res = await apiv3Get<EncryptionStatus>(
    '/chat-integration/admin/encryption-status',
  );
  return res.data;
};

const fetchRelations = async (): Promise<AdminRelationListItem[]> => {
  const res = await apiv3Get<{ relations: AdminRelationListItem[] }>(
    '/chat-integration/admin/relations',
  );
  return res.data.relations;
};

const fetchCapabilitiesFor = (
  relationId: string,
): (() => Promise<CapabilityReport>) => {
  return async () => {
    const res = await apiv3Get<CapabilityReport>(
      `/chat-integration/admin/relations/${relationId}/capabilities`,
    );
    return res.data;
  };
};

const fetchConnectionStatusFor = (
  relationId: string,
): (() => Promise<ConnectionStatusView>) => {
  return async () => {
    const res = await apiv3Get<ConnectionStatusView>(
      `/chat-integration/admin/relations/${relationId}/connection-status`,
    );
    return res.data;
  };
};

// ============================================================================
// Sub-sections
// ============================================================================

/**
 * Renders `CapabilityReport` generically -- every platform, every
 * capability, whatever `level`/`substitute` the proxy reports. No field is
 * assumed, dropped, or branched on by name.
 */
const CapabilityReportTable = ({
  report,
}: {
  report: CapabilityReport;
}): JSX.Element => (
  <table className="table table-sm table-bordered mb-0">
    <thead>
      <tr>
        <th>Platform</th>
        <th>Capability</th>
        <th>Level</th>
        <th>Substitute</th>
      </tr>
    </thead>
    <tbody>
      {report.platforms.flatMap((platformEntry) =>
        platformEntry.capabilities.map((cap) => (
          <tr
            key={`${platformEntry.platform}-${cap.capability}`}
            data-testid="grw-chat-integration-capability-row"
          >
            <td>{platformEntry.platform}</td>
            <td>{cap.capability}</td>
            <td>{cap.level}</td>
            <td>{cap.substitute ?? '—'}</td>
          </tr>
        )),
      )}
    </tbody>
  </table>
);

/** One relation's row: static info plus, for an active relation, live capabilities + connection status. */
const RelationRow = ({
  relation,
}: {
  relation: AdminRelationListItem;
}): JSX.Element => {
  const isActive = relation.state === 'active';

  const { data: capabilities, error: capabilitiesError } =
    useSWR<CapabilityReport>(
      isActive
        ? `chat-integration-admin-capabilities-${relation.relationId}`
        : null,
      isActive ? fetchCapabilitiesFor(relation.relationId) : null,
    );

  const { data: connectionStatus, error: connectionStatusError } =
    useSWR<ConnectionStatusView>(
      isActive
        ? `chat-integration-admin-connection-status-${relation.relationId}`
        : null,
      isActive ? fetchConnectionStatusFor(relation.relationId) : null,
      { refreshInterval: 15000 },
    );

  return (
    <div
      className="border rounded p-3 mb-3"
      data-testid="grw-chat-integration-relation-row"
    >
      <div className="d-flex justify-content-between align-items-center mb-2">
        <div>
          <strong>{relation.label ?? relation.workspaceName}</strong>{' '}
          <span className="text-muted">({relation.platform})</span>
        </div>
        <span className={`badge ${isActive ? 'bg-success' : 'bg-secondary'}`}>
          {relation.state}
        </span>
      </div>

      {isActive && (
        <div className="mb-2">
          <span className="fw-bold me-2">Connection:</span>
          {connectionStatusError != null && (
            <span className="text-danger">
              Failed to load connection status
            </span>
          )}
          {connectionStatus != null && (
            <span data-testid="grw-chat-integration-connection-health">
              {connectionStatus.health}
            </span>
          )}
        </div>
      )}

      {isActive && (
        <div>
          <span className="fw-bold">What this service can do:</span>
          {capabilitiesError != null && (
            <p className="text-danger mb-0">Failed to load capabilities</p>
          )}
          {capabilities != null && (
            <CapabilityReportTable report={capabilities} />
          )}
        </div>
      )}
    </div>
  );
};

interface PairingFormState {
  readonly registrationCode: string;
  readonly proxyUri: string;
  readonly growiUri: string;
  readonly growiLabel: string;
}

const EMPTY_PAIRING_FORM: PairingFormState = {
  registrationCode: '',
  proxyUri: '',
  growiUri: '',
  growiLabel: '',
};

const describePairingOutcome = (outcome: PairingOutcome): string => {
  switch (outcome.status) {
    case 'paired':
      return `Paired successfully (relation: ${outcome.relationId}).`;
    case 'relation-already-known':
      return 'This proxy already returned a relation this GROWI already has -- pairing was not established.';
    case 'already-paired':
      return `The proxy refused: ${outcome.detail}`;
    case 'code-expired':
      return 'The registration code has expired.';
    case 'ownership-unverified':
      return `The proxy could not verify this GROWI's URL: ${outcome.detail}`;
    case 'call-failed':
      return `Could not reach the proxy (${outcome.reason}).`;
    case 'key-encryption-unconfigured':
      return 'The encryption key is not configured -- pairing cannot start.';
    default:
      return 'Unknown outcome.';
  }
};

/** Pairing form: paste a registration code the proxy issued (task 7.3). Disabled while the encryption key is unconfigured. */
const PairingSection = ({
  encryptionConfigured,
  onPaired,
}: {
  encryptionConfigured: boolean;
  onPaired: () => void;
}): JSX.Element => {
  const [form, setForm] = useState<PairingFormState>(EMPTY_PAIRING_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // useId() output is safe here (id=/htmlFor= use getElementById, which does
  // not parse the colons useId() produces as CSS) -- see
  // apps/app/.claude/rules/ui-pitfalls.md. Only a reactstrap `target` prop
  // would be unsafe, and none of these fields use one.
  const registrationCodeId = useId();
  const proxyUriId = useId();
  const growiUriId = useId();
  const growiLabelId = useId();

  const handleChange = useCallback(
    (field: keyof PairingFormState) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm((prev) => ({ ...prev, [field]: e.target.value }));
      },
    [],
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      try {
        const res = await apiv3Post<PairingOutcome>(
          '/chat-integration/admin/pairing',
          form,
        );
        const outcome = res.data;
        if (outcome.status === 'paired') {
          toastSuccess(describePairingOutcome(outcome));
          setForm(EMPTY_PAIRING_FORM);
          onPaired();
        } else {
          toastError(describePairingOutcome(outcome));
        }
      } catch (err) {
        toastError(err);
      } finally {
        setIsSubmitting(false);
      }
    },
    [form, onPaired],
  );

  return (
    <div className="mb-5" data-testid="grw-chat-integration-pairing-section">
      <h2 className="admin-setting-header">Connect a workspace</h2>

      {!encryptionConfigured && (
        <div className="alert alert-warning" role="alert">
          The chat-integration encryption key is not configured. Pairing is
          disabled until an administrator sets it.
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-2">
          <label className="form-label" htmlFor={registrationCodeId}>
            Registration code
          </label>
          <input
            id={registrationCodeId}
            type="text"
            className="form-control"
            value={form.registrationCode}
            onChange={handleChange('registrationCode')}
            disabled={!encryptionConfigured}
            required
          />
        </div>
        <div className="mb-2">
          <label className="form-label" htmlFor={proxyUriId}>
            Proxy URL
          </label>
          <input
            id={proxyUriId}
            type="text"
            className="form-control"
            value={form.proxyUri}
            onChange={handleChange('proxyUri')}
            disabled={!encryptionConfigured}
            required
          />
        </div>
        <div className="mb-2">
          <label className="form-label" htmlFor={growiUriId}>
            This GROWI's URL
          </label>
          <input
            id={growiUriId}
            type="text"
            className="form-control"
            value={form.growiUri}
            onChange={handleChange('growiUri')}
            disabled={!encryptionConfigured}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label" htmlFor={growiLabelId}>
            Label to show the chat service
          </label>
          <input
            id={growiLabelId}
            type="text"
            className="form-control"
            value={form.growiLabel}
            onChange={handleChange('growiLabel')}
            disabled={!encryptionConfigured}
            required
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={!encryptionConfigured || isSubmitting}
        >
          {isSubmitting ? 'Pairing…' : 'Pair'}
        </button>
      </form>
    </div>
  );
};

// ============================================================================
// Main component
// ============================================================================

export const AdminChatIntegration = (): JSX.Element => {
  const { data: encryptionStatus } = useSWR<EncryptionStatus>(
    'chat-integration-admin-encryption-status',
    fetchEncryptionStatus,
  );
  const {
    data: relations,
    isLoading,
    mutate: mutateRelations,
  } = useSWR<AdminRelationListItem[]>(
    'chat-integration-admin-relations',
    fetchRelations,
  );

  const handlePaired = useCallback(() => {
    mutateRelations();
  }, [mutateRelations]);

  return (
    <div data-testid="grw-chat-integration-admin">
      <PairingSection
        encryptionConfigured={encryptionStatus?.configured ?? false}
        onPaired={handlePaired}
      />

      <div>
        <h2 className="admin-setting-header">Connected workspaces</h2>
        {isLoading && <p>Loading…</p>}
        {!isLoading && (relations == null || relations.length === 0) && (
          <p>No workspace has been paired yet.</p>
        )}
        {relations?.map((relation) => (
          <RelationRow key={relation.relationId} relation={relation} />
        ))}
      </div>
    </div>
  );
};

AdminChatIntegration.displayName = 'AdminChatIntegration';
