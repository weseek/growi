import React from 'react';

export default class PagePath extends React.Component {

  // Original Crowi.linkPath
  /*
  Crowi.linkPath = function(revisionPath) {
    var $revisionPath = revisionPath || '#revision-path';
    var $title = $($revisionPath);
    var pathData = $('#content-main').data('path');

    if (!pathData) {
      return ;
    }

    var realPath = pathData.trim();
    if (realPath.substr(-1, 1) == '/') {
      realPath = realPath.substr(0, realPath.length - 1);
    }

    var path = '';
    var pathHtml = '';
    var splittedPath = realPath.split(/\//);
    splittedPath.shift();
    splittedPath.forEach(function(sub) {
      path += '/';
      pathHtml += ' <a href="' + path + '">/</a> ';
      if (sub) {
        path += sub;
        pathHtml += '<a href="' + path + '">' + sub + '</a>';
      }
    });
    if (path.substr(-1, 1) != '/') {
      path += '/';
      pathHtml += ' <a href="' + path + '" class="last-path">/</a>';
    }
    $title.html(pathHtml);
  };
  */

  linkPath(path) {
    return path;
  }

  render() {
    const page = this.props.page;
    const shortPath = this.getShortPath(page.path);
    const pathPrefix = page.path.replace(new RegExp(shortPath + '(/)?$'), '');

    return (
      <span className="page-path">
        {pathPrefix}<strong>{shortPath}</strong>
      </span>
    );
  }
}

PagePath.propTypes = {
  page: React.PropTypes.object.isRequired,
};

PagePath.defaultProps = {
  page: {},
};
