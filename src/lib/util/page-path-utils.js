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

module.exports = {
  encodePagePath: encodePagePath,
  encodePagesPath: encodePagesPath
};
