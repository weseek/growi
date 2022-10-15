import { SearchResultItem, PluginItem } from './SearchResultItem';

export type SearchResult = {
  total_count: number,
  imcomplete_results: boolean,
  items: SearchResultItem[];
}

export type PluginResult = {
  items: PluginItem[];
}
