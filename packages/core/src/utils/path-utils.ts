function matchSlashes(path: string): RegExpMatchArray | null {
  // https://regex101.com/r/FzHxQ9/1
  return path.match(/^(?=\/|[^\n])((\/+)?([^\n]+?))(\/+)?$/);
}

export function hasHeadingSlash(path: string): boolean {
  if (path === '/') return true;

  const match = matchSlashes(path);
  return (match?.[2] != null);
}

export function hasTrailingSlash(path: string): boolean {
  if (path === '/') return true;

  const match = matchSlashes(path);
  return (match?.[4] != null);
}

export function addHeadingSlash(path: string): string {
  if (path === '/') {
    return path;
  }

  if (!hasHeadingSlash(path)) {
    return `/${path}`;
  }
  return path;
}

export function addTrailingSlash(path: string): string {
  if (path === '/') {
    return path;
  }

  if (!hasTrailingSlash(path)) {
    return `${path}/`;
  }
  return path;
}

export function removeHeadingSlash(path: string): string {
  if (path === '/') {
    return path;
  }

  return hasHeadingSlash(path)
    ? path.substring(1)
    : path;
}

export function removeTrailingSlash(path: string): string {
  if (path === '/') {
    return path;
  }

  const match = matchSlashes(path);
  return match != null ? match[1] : path;
}

/**
 * A short-hand method to add heading slash and remove trailing slash.
 */
export function normalizePath(path: string): string {
  if (path === '' || path === '/') {
    return '/';
  }

  const match = matchSlashes(path);
  if (match == null) {
    return '/';
  }
  return `/${match[3]}`;
}


export function attachTitleHeader(path: string): string {
  return `# ${path}`;
}

/**
 * If the pagePath is top page path, eliminate the pageId from the url path.
 */
export function returnPathForURL(path: string, id: string): string {
  if (path === '/') {
    return path;
  }

  return addHeadingSlash(id);
}

/**
 * Get the parent path of the specified path.
 */
export function getParentPath(path: string): string {
  return normalizePath(path.split('/').slice(0, -1).join('/'));
}
