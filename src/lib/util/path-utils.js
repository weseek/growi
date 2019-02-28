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

function matchTrailingSlash(path) {
  // https://regex101.com/r/Z21fEd/1
  return path.match(/(.+?)(\/)?$/);
}

function hasTrailingSlash(path) {
  const match = matchTrailingSlash(path);
  return (match[2] != null);
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

  const match = matchTrailingSlash(path);
  return match[1];
}

module.exports = {
  encodePagePath,
  encodePagesPath,
  hasTrailingSlash,
  addTrailingSlash,
  removeTrailingSlash,
};
