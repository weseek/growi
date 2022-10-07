export type SearchResultItem = {
  id: number,
  name: string,
  owner: {
    login: string,
    html_url: string,
    avatar_url: string,
  },
  fullName: string,
  htmlUrl: string,
  description: string,
  topics: string[],
  homepage: string,
  stargazersCount: number,
}
