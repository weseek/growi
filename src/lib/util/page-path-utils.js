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

function matchEndWithSlash(path) {
  // https://regex101.com/r/Z21fEd/1
  return path.match(/(.+?)(\/)?$/);
}

function isEndWithSlash(path) {
  const match = matchEndWithSlash(path);
  return (match[2] != null);
}

function addSlashToTheEnd(path) {
  if (!isEndWithSlash(path)) {
    return `${path}/`;
  }
  return path;
}

function removeLastSlash(path) {
  if (path === '/') {
    return path;
  }

  const match = matchEndWithSlash(path);
  return match[1];
}

module.exports = {
  encodePagePath,
  encodePagesPath,
  isEndWithSlash,
  addSlashToTheEnd,
  removeLastSlash,
};
