import React from 'react';
// import PropTypes from 'prop-types';

// SearchTypeahead wrapper
export default class TagsListPage extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      tags: ['growi', 'wiki', 'tag'],
    };
  }

  render() {
    return (
      <div>
        <ul className="list-group　mx-4">
          {this.state.tags.map((tag) => {
            return (
              <a href={`/_search?q=tag:${tag}`} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                <p className="float-left my-0">{tag}</p>
              </a>
            );
          })}
        </ul>
      </div>
    );
  }

}

TagsListPage.propTypes = {
};

TagsListPage.defaultProps = {
};
