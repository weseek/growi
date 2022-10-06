export type SearchResultItem = {
  id: number,
  name: string,
  owner: {
    login: string,
    html_url: string,
    avatar_url: string,
  },
  full_name: string,
  html_url: string,
  description: string,
  topics: string[],
  homepage: string,
  stargazers_count: number,
}
