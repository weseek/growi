// file upload types actually supported by the app
export const FileUploadType = {
  aws: 'aws',
  gcs: 'gcs',
  azure: 'azure',
  gridfs: 'gridfs',
  local: 'local',
} as const;

export type FileUploadType = typeof FileUploadType[keyof typeof FileUploadType]

// file upload type strings you can specify in the env var
export const FileUploadTypeForEnvVar = {
  ...FileUploadType,
  mongo:   'mongo',
  mongodb: 'mongodb',
  gcp:     'gcp',
} as const;

export type FileUploadTypeForEnvVar = typeof FileUploadTypeForEnvVar[keyof typeof FileUploadTypeForEnvVar]
