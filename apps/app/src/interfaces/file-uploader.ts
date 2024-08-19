export const FileUploadType = {
  aws: 'aws',
  gcs: 'gcs',
  azure: 'azure',
  gridfs: 'gridfs',
  local: 'local',
} as const;

export type FileUploadType = typeof FileUploadType[keyof typeof FileUploadType]

export const FileUploadEnvVarType = {
  ...FileUploadType,
  mongo:   'mongo',
  mongodb: 'mongodb',
  gcp:     'gcp',
} as const;

export type FileUploadEnvVarType = typeof FileUploadEnvVarType[keyof typeof FileUploadEnvVarType]
