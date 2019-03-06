import React from 'react';
import PropTypes from 'prop-types';

import Page from './Page';

export default class ListView extends React.Component {

  render() {
    const listView = this.props.pages.map((page) => {
      return <Page page={page} key={'page-list:list-view:' + page._id} />;
    });

    return (
      <div className="page-list">
        <ul className="page-list-ul page-list-ul-flat">
        {listView}
        </ul>
      </div>
    );
  }
}

ListView.propTypes = {
  pages: PropTypes.array.isRequired,
};

ListView.defaultProps = {
  pages: [],
};
