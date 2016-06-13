import React from 'react';

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
