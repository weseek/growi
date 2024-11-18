interface ConfigDefinition<T> {
  envVarName: string;
  defaultValue: T;
  isSecret?: boolean;
}

export const CONFIG_KEYS = [
  // App Settings
  'app:fileUploadType',
  'app:useOnlyEnvVarForFileUploadType',
  'app:plantumlUri',
  'app:drawioUri',
  'app:nchanUri',
  'app:siteUrl',
  'app:aiEnabled',
  // Security Settings
  'security:passport-local:isEnabled',
  'security:passport-saml:isEnabled',
  'security:passport-saml:entryPoint',
  'security:passport-saml:issuer',
  'security:passport-saml:cert',
  // GCS Settings
  'gcs:apiKeyJsonPath',
  'gcs:bucket',
  'gcs:uploadNamespace',
  // Azure Settings
  'azure:tenantId',
  'azure:clientId',
  'azure:clientSecret',
  'azure:storageAccountName',
  'azure:storageContainerName',
  // OpenTelemetry Settings
  'otel:enabled',
  'otel:isAppSiteUrlHashed',
  'otel:serviceInstanceId',
  // OpenAI Settings
  'openai:serviceType',
  'openai:apiKey',
  'openai:searchAssistantInstructions',
  // Control Flags for Env Vars
  'env:useSiteUrlEnvVars',
  'env:useLocalStrategyEnvVars',
  'env:useSamlEnvVars',
  'env:useFileUploadEnvVars',
  'env:useGcsEnvVars',
  'env:useAzureEnvVars',
] as const;

export type ConfigKey = (typeof CONFIG_KEYS)[number];

// Safe accessor object

type ValidateKeyFn = (key: unknown) => asserts key is ConfigKey;
export const ConfigKeys = {
  all: CONFIG_KEYS,
  includes: (key: unknown): key is ConfigKey => CONFIG_KEYS.includes(key as any),
  validateKey: ((key: unknown): asserts key is ConfigKey => {
    if (!ConfigKeys.includes(key)) {
      throw new Error(`Invalid config key: ${String(key)}`);
    }
  }) satisfies ValidateKeyFn,
} as const;

type ConfigDefinitions = {
  [K in ConfigKey]: ConfigDefinition<unknown>;
};

export const CONFIG_DEFINITIONS: ConfigDefinitions = {
  // App Settings
  'app:fileUploadType': {
    envVarName: 'FILE_UPLOAD',
    defaultValue: 'aws',
  },
  'app:useOnlyEnvVarForFileUploadType': {
    envVarName: 'FILE_UPLOAD_USES_ONLY_ENV_VAR_FOR_FILE_UPLOAD_TYPE',
    defaultValue: false,
  },
  'app:plantumlUri': {
    envVarName: 'PLANTUML_URI',
    defaultValue: 'https://www.plantuml.com/plantuml',
  },
  'app:drawioUri': {
    envVarName: 'DRAWIO_URI',
    defaultValue: 'https://embed.diagrams.net/',
  },
  'app:nchanUri': {
    envVarName: 'NCHAN_URI',
    defaultValue: null,
  },
  'app:siteUrl': {
    envVarName: 'APP_SITE_URL',
    defaultValue: null,
  },
  'app:aiEnabled': {
    envVarName: 'AI_ENABLED',
    defaultValue: false,
  },

  // Security Settings
  'security:passport-local:isEnabled': {
    envVarName: 'SECURITY_PASSPORT_LOCAL_ENABLED',
    defaultValue: true,
  },
  'security:passport-saml:isEnabled': {
    envVarName: 'SECURITY_PASSPORT_SAML_ENABLED',
    defaultValue: false,
  },
  'security:passport-saml:entryPoint': {
    envVarName: 'SECURITY_PASSPORT_SAML_ENTRY_POINT',
    defaultValue: '',
  },
  'security:passport-saml:issuer': {
    envVarName: 'SECURITY_PASSPORT_SAML_ISSUER',
    defaultValue: '',
  },
  'security:passport-saml:cert': {
    envVarName: 'SECURITY_PASSPORT_SAML_CERT',
    defaultValue: '',
  },

  // GCS Settings
  'gcs:apiKeyJsonPath': {
    envVarName: 'GCS_API_KEY_JSON_PATH',
    defaultValue: '',
  },
  'gcs:bucket': {
    envVarName: 'GCS_BUCKET',
    defaultValue: '',
  },
  'gcs:uploadNamespace': {
    envVarName: 'GCS_UPLOAD_NAMESPACE',
    defaultValue: '',
  },

  // Azure Settings
  'azure:tenantId': {
    envVarName: 'AZURE_TENANT_ID',
    defaultValue: '',
  },
  'azure:clientId': {
    envVarName: 'AZURE_CLIENT_ID',
    defaultValue: '',
  },
  'azure:clientSecret': {
    envVarName: 'AZURE_CLIENT_SECRET',
    defaultValue: '',
    isSecret: true,
  },
  'azure:storageAccountName': {
    envVarName: 'AZURE_STORAGE_ACCOUNT_NAME',
    defaultValue: '',
  },
  'azure:storageContainerName': {
    envVarName: 'AZURE_STORAGE_CONTAINER_NAME',
    defaultValue: '',
  },

  // OpenTelemetry Settings
  'otel:enabled': {
    envVarName: 'OPENTELEMETRY_ENABLED',
    defaultValue: true,
  },
  'otel:isAppSiteUrlHashed': {
    envVarName: 'OPENTELEMETRY_IS_APP_SITE_URL_HASHED',
    defaultValue: false,
  },
  'otel:serviceInstanceId': {
    envVarName: 'OPENTELEMETRY_SERVICE_INSTANCE_ID',
    defaultValue: null,
  },

  // OpenAI Settings
  'openai:serviceType': {
    envVarName: 'OPENAI_SERVICE_TYPE',
    defaultValue: null,
  },
  'openai:apiKey': {
    envVarName: 'OPENAI_API_KEY',
    defaultValue: null,
    isSecret: true,
  },
  'openai:searchAssistantInstructions': {
    envVarName: 'OPENAI_SEARCH_ASSISTANT_INSTRUCTIONS',
    defaultValue: null,
  },

  // Control Flags for Env Vars
  'env:useSiteUrlEnvVars': {
    envVarName: 'APP_SITE_URL_USES_ONLY_ENV_VARS',
    defaultValue: false,
  },
  'env:useLocalStrategyEnvVars': {
    envVarName: 'SECURITY_PASSPORT_LOCAL_USES_ONLY_ENV_VARS',
    defaultValue: false,
  },
  'env:useSamlEnvVars': {
    envVarName: 'SECURITY_PASSPORT_SAML_USES_ONLY_ENV_VARS',
    defaultValue: false,
  },
  'env:useFileUploadEnvVars': {
    envVarName: 'FILE_UPLOAD_USES_ONLY_ENV_VARS',
    defaultValue: false,
  },
  'env:useGcsEnvVars': {
    envVarName: 'GCS_USES_ONLY_ENV_VARS',
    defaultValue: false,
  },
  'env:useAzureEnvVars': {
    envVarName: 'AZURE_USES_ONLY_ENV_VARS',
    defaultValue: false,
  },
};

// Define groups of settings that use only environment variables
export interface EnvOnlyGroup {
  controlKey: ConfigKey;
  targetKeys: ConfigKey[];
}

export const ENV_ONLY_GROUPS: EnvOnlyGroup[] = [
  {
    controlKey: 'env:useSiteUrlEnvVars',
    targetKeys: ['app:siteUrl'],
  },
  {
    controlKey: 'env:useLocalStrategyEnvVars',
    targetKeys: ['security:passport-local:isEnabled'],
  },
  {
    controlKey: 'env:useSamlEnvVars',
    targetKeys: [
      'security:passport-saml:isEnabled',
      'security:passport-saml:entryPoint',
      'security:passport-saml:issuer',
      'security:passport-saml:cert',
    ],
  },
  {
    controlKey: 'env:useFileUploadEnvVars',
    targetKeys: ['app:fileUploadType'],
  },
  {
    controlKey: 'env:useGcsEnvVars',
    targetKeys: [
      'gcs:apiKeyJsonPath',
      'gcs:bucket',
      'gcs:uploadNamespace',
    ],
  },
  {
    controlKey: 'env:useAzureEnvVars',
    targetKeys: [
      'azure:tenantId',
      'azure:clientId',
      'azure:clientSecret',
      'azure:storageAccountName',
      'azure:storageContainerName',
    ],
  },
];

export type ConfigSource = 'env' | 'db';

export type ConfigValues = {
  [K in ConfigKey]: (typeof CONFIG_DEFINITIONS)[K] extends ConfigDefinition<infer T> ? T : never;
};

export interface RawConfigData {
  env: Partial<ConfigValues>;
  db: Partial<ConfigValues>;
}

export type MergedConfigData = {
  [K in ConfigKey]: {
    value: ConfigValues[K];
    source: ConfigSource;
  }
};

// Runtime consistency check
const validateConfigDefinitions = (): void => {
  for (const key of CONFIG_KEYS) {
    if (!(key in CONFIG_DEFINITIONS)) {
      throw new Error(`Missing config definition for key: ${key}`);
    }
  }
};

validateConfigDefinitions();
