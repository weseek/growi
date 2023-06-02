export type LsxApiOptions = {
  depth?: string,
  filter?: string,
  except?: string,
  sort?: string,
  reverse?: string,
}

export type LsxApiParams = {
  pagePath: string,
  offset?: number,
  limit?: number,
  options?: LsxApiOptions,
}
