import React from 'react';

import Page from './Page';

export default class ListView extends React.Component {

  render() {
    const listView = this.props.pages.map((page) => {
      return <Page page={page} />;
    });

    return (
      <div className="page-list">
        <ul className="page-list-ul">
        {listView}
        </ul>
      </div>
    );
  }
}

ListView.propTypes = {
  pages: React.PropTypes.array.isRequired,
};

ListView.defaultProps = {
  pages: [],
};
