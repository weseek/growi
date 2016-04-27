import React from 'react';

export default class ListView extends React.Component {

  render() {
    const listView = this.props.pages.map(function(page) {
      return (
        <div key={page.path}>
          {page.path} by {page.author}
        </div>
      );
    });

    return (
      <div className="page-list">
        {listView}
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
