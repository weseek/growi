import React from 'react';
import PropTypes from 'prop-types';

export default class PagePath extends React.Component {

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
  page: PropTypes.object.isRequired,
};

PagePath.defaultProps = {
  page: {},
};
