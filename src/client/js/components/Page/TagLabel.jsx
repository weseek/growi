import React from 'react';
import PropTypes from 'prop-types';

export default class TagLabel extends React.Component {

  render() {
    const tags = [];
    const tagListstyle = {
      borderRadius: '5px',
      marginLeft: '5px',
      fontSize: '12px',
      height: '20px',
      padding: '0px 10px',
    };

    if (this.props.currentPageTags.length === 0) {
      return (
        <div style={tagListstyle}>
        tag is not set
        </div>
      );
    }

    for (let i = 0; i < this.props.currentPageTags.length; i++) {
      tags.push(
        <div style={tagListstyle} key={i.toString()} className="label label-info">{this.props.currentPageTags[i]}</div>,
      );
    }

    return (
      <div>
        {tags}
      </div>
    );
  }

}

TagLabel.propTypes = {
  currentPageTags: PropTypes.array.isRequired,
};
