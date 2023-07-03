import type { TemplateSummary, TemplateStatus } from '../interfaces';

export const getLocalizedTemplate = (templateSummary: TemplateSummary | undefined, locale?: string): TemplateStatus | undefined => {
  if (templateSummary == null) {
    return undefined;
  }

  return locale != null
    ? templateSummary[locale]
    : templateSummary.default;
};
