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
    const isShortPathOnly = this.props.isShortPathOnly;
    const pagePath = decodeURIComponent(page.path.replace(this.props.excludePathString.replace(/^\//, ''), ''));
    const shortPath = this.getShortPath(pagePath);

    const shortPathEscaped = escapeStringRegexp(shortPath);
    const pathPrefix = pagePath.replace(new RegExp(shortPathEscaped + '(/)?$'), '');

    let classNames = ['page-path'];
    classNames = classNames.concat(this.props.additionalClassNames);

    if (isShortPathOnly) {
      return <span className={classNames.join(' ')}>{shortPath}</span>;
    }
    else {
      return <span className={classNames.join(' ')}>{pathPrefix}<strong>{shortPath}</strong></span>;
    }

  }
}

PagePath.propTypes = {
  page: PropTypes.object.isRequired,
  isShortPathOnly: PropTypes.bool,
  excludePathString: PropTypes.string,
  additionalClassNames: PropTypes.array,
};

PagePath.defaultProps = {
  page: {},
  additionalClassNames: [],
  excludePathString: '',
};
