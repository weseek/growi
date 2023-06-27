export type TemplateStatusBasis = {
  id: string,
  locale: string,
}
export type TemplateStatusValid = TemplateStatusBasis & {
  isValid: true,
  isDefault: boolean,
  title: string,
}
export type TemplateStatusInvalid = TemplateStatusBasis & {
  isValid: false,
  invalidReason: string,
}
export type TemplateStatus = TemplateStatusValid | TemplateStatusInvalid;

export type TemplateSummary = {
  default: TemplateStatusValid,
  [locale: string]: TemplateStatus,
}

export type TemplateSummaries = {
  [templateId: string]: TemplateSummary,
}
