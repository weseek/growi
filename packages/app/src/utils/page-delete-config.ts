import { PageDeleteConfigValue as Value, PageDeleteConfigValueToProcessValidation } from '~/interfaces/page-delete-config';

/**
 * Return true if "configForRecursive" is stronger than "configForSingle"
 * Strength: "Admin" > "Admin and author" > "Anyone"
 * @param configForSingle PageDeleteConfigValueToProcessValidation
 * @param configForRecursive PageDeleteConfigValueToProcessValidation
 * @returns boolean
 */
export const validateDeleteConfigs = (
    configForSingle: PageDeleteConfigValueToProcessValidation, configForRecursive: PageDeleteConfigValueToProcessValidation,
): boolean => {
  if (configForSingle === Value.Anyone) {
    switch (configForRecursive) {
      case Value.Anyone:
      case Value.AdminAndAuthor:
      case Value.AdminOnly:
        return true;
    }
  }

  if (configForSingle === Value.AdminAndAuthor) {
    switch (configForRecursive) {
      case Value.Anyone:
        return false;
      case Value.AdminAndAuthor:
      case Value.AdminOnly:
        return true;
    }
  }

  if (configForSingle === Value.AdminOnly) {
    switch (configForRecursive) {
      case Value.Anyone:
      case Value.AdminAndAuthor:
        return false;
      case Value.AdminOnly:
        return true;
    }
  }

  return false;
};
