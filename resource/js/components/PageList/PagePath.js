import React from 'react';
import PropTypes from 'prop-types';

import escapeStringRegexp from 'escape-string-regexp';

export default class PagePath extends React.Component {

  getShortPath(path) {
    let name = path.replace(/(\/)$/, '');

    // /.../hoge/YYYY/MM/DD 形式のページ
    if (name.match(/.+\/([^/]+\/\d{4}\/\d{2}\/\d{2})$/)) {
      return name.replace(/.+\/([^/]+\/\d{4}\/\d{2}\/\d{2})$/, '$1');
    }

    // /.../hoge/YYYY/MM 形式のページ
    if (name.match(/.+\/([^/]+\/\d{4}\/\d{2})$/)) {
      return name.replace(/.+\/([^/]+\/\d{4}\/\d{2})$/, '$1');
    }

    // /.../hoge/YYYY 形式のページ
    if (name.match(/.+\/([^/]+\/\d{4})$/)) {
      return name.replace(/.+\/([^/]+\/\d{4})$/, '$1');
    }

    // ページの末尾を拾う
    return name.replace(/.+\/(.+)?$/, '$1');
  }

  render() {
    const page = this.props.page;
    const pagePath = page.path.replace(this.props.excludePathString.replace(/^\//, ''), '');
    const shortPath = this.getShortPath(pagePath);
    const shortPathEscaped = escapeStringRegexp(shortPath);
    const pathPrefix = pagePath.replace(new RegExp(shortPathEscaped + '(/)?$'), '');

    return (
      <span className="page-path">
        {pathPrefix}<strong>{shortPath}</strong>
      </span>
    );
  }
}

PagePath.propTypes = {
  page: PropTypes.object.isRequired,
};

PagePath.defaultProps = {
  page: {},
  excludePathString: '',
};
