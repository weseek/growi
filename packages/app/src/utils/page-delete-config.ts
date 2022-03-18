import {
  PageDeleteConfigValue as Value, IPageDeleteConfigValueToProcessValidation,
  IPageDeleteConfigValue,
} from '~/interfaces/page-delete-config';

/**
 * Return true if "configForRecursive" is stronger than "configForSingle"
 * Strength: "Admin" > "Admin and author" > "Anyone"
 * @param configForSingle IPageDeleteConfigValueToProcessValidation
 * @param configForRecursive IPageDeleteConfigValueToProcessValidation
 * @returns boolean
 */
export const validateDeleteConfigs = (
    configForSingle: IPageDeleteConfigValueToProcessValidation, configForRecursive: IPageDeleteConfigValueToProcessValidation,
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

/**
 * Convert IPageDeleteConfigValue.Inherit to the calculable value
 * @param confForSingle IPageDeleteConfigValueToProcessValidation
 * @param confForRecursive IPageDeleteConfigValue
 * @returns IPageDeleteConfigValueToProcessValidation
 */
export const prepareDeleteConfigValuesForCalc = (
    confForSingle: IPageDeleteConfigValueToProcessValidation, confForRecursive: IPageDeleteConfigValue,
): [IPageDeleteConfigValueToProcessValidation, IPageDeleteConfigValueToProcessValidation] => {
  if (confForRecursive === Value.Inherit) {
    return [confForSingle, confForSingle];
  }

  return [confForSingle, confForRecursive];
};
