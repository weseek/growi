const MIGRATE_LOCALE_MAP = {
  en: 'en_US',
  ja: 'ja_JP',
};

export const migrateDeprecatedLocaleId = (localeId: string): string => {
  const toValue = MIGRATE_LOCALE_MAP[localeId];

  if (toValue != null) {
    return toValue;
  }

  return localeId;
};
