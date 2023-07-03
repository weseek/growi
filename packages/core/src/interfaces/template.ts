export type ITemplateIdentification = {
  id: string,
  locale: string,
}

export type ITemplate = ITemplateIdentification & {
  name: string,
  markdown: string,
}
