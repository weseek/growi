import React from 'react';
import PropTypes from 'prop-types';

export class PagePath extends React.Component {

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
    const pagePath = this.props.pagePath.replace(this.props.excludePathString.replace(/^\//, ''), '');
    const shortPath = this.getShortPath(pagePath);

    let classNames = ['page-path']
    if (!this.props.isExists) {
      classNames.push('lsx-page-not-exist');
    }

    return (
      <span className={classNames.join(' ')}>
        {shortPath}
      </span>
    );
  }
}

PagePath.propTypes = {
  pagePath: PropTypes.string.isRequired,
  isExists: PropTypes.bool.isRequired,
};

PagePath.defaultProps = {
  excludePathString: '',
};
