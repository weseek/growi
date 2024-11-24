import type { ConfigDefinition } from '../interfaces/config-manager';

export function getManagedEnvVars(
    definitions: ConfigDefinition<unknown>[],
    includeSecret: boolean,
): Record<string, string> {
  const envVars: Record<string, string> = {};

  for (const metadata of definitions) {
    const { envVarName } = metadata;
    if (envVarName == null) {
      continue;
    }

    const envVarValue = process.env[envVarName];
    if (envVarValue == null) {
      continue;
    }

    // skip secret
    if (metadata.isSecret && !includeSecret) {
      continue;
    }

    envVars[envVarName] = envVarValue;
  }

  return envVars;
}
