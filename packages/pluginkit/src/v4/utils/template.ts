import { Lang } from '@growi/core';

import type { TemplateSummary, TemplateStatus } from '../interfaces';

export const getLocalizedTemplate = (templateSummary: TemplateSummary | undefined, locale?: string, usersDefaultLang?: Lang): TemplateStatus | undefined => {
  if (templateSummary == null) {
    return undefined;
  }

  const selectedLocale = usersDefaultLang ?? locale;

  return selectedLocale != null && selectedLocale in templateSummary
    ? templateSummary[selectedLocale]
    : templateSummary.default;
};

export const getTemplateLocales = (templateSummary: TemplateSummary | undefined): Set<string> | undefined => {
  if (templateSummary == null) {
    return undefined;
  }

  return new Set(Object.values(templateSummary).map(s => s.locale));
};
