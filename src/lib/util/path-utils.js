'use strict';

function encodePagesPath(pages) {
  pages.forEach(function(page) {
    if (!page.path) {
      return;
    }
    page.path = encodePagePath(page.path);
  });
  return pages;
}

function encodePagePath(path) {
  const paths = path.split('/');
  paths.forEach(function(item, index) {
    paths[index] = encodeURIComponent(item);
  });
  return paths.join('/');
}

function matchSlashes(path) {
  // https://regex101.com/r/Z21fEd/3
  return path.match(/^((\/)?(.+?))(\/)?$$/);
}

function hasHeadingSlash(path) {
  const match = matchSlashes(path);
  return (match[2] != null);
}

function hasTrailingSlash(path) {
  const match = matchSlashes(path);
  return (match[4] != null);
}

function addHeadingSlash(path) {
  if (path === '/') {
    return path;
  }

  if (!hasHeadingSlash(path)) {
    return `/${path}`;
  }
  return path;
}

function addTrailingSlash(path) {
  if (path === '/') {
    return path;
  }

  if (!hasTrailingSlash(path)) {
    return `${path}/`;
  }
  return path;
}

function removeTrailingSlash(path) {
  if (path === '/') {
    return path;
  }

  const match = matchSlashes(path);
  return match[1];
}

function normalizePath(path) {
  return this.addHeadingSlash(this.removeTrailingSlash(path));
}

module.exports = {
  encodePagePath,
  encodePagesPath,
  hasHeadingSlash,
  hasTrailingSlash,
  addHeadingSlash,
  addTrailingSlash,
  removeTrailingSlash,
  normalizePath,
};
