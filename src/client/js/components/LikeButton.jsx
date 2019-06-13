import React from 'react';
import PropTypes from 'prop-types';

import { createSubscribedElement } from './UnstatedUtils';
import AppContainer from '../services/AppContainer';

class LikeButton extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isLiked: !!props.isLiked,
    };

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(event) {
    event.preventDefault();

    const { appContainer } = this.props;
    const pageId = this.props.pageId;

    if (!this.state.isLiked) {
      appContainer.apiPost('/likes.add', { page_id: pageId })
        .then((res) => {
          this.setState({ isLiked: true });
        });
    }
    else {
      appContainer.apiPost('/likes.remove', { page_id: pageId })
        .then((res) => {
          this.setState({ isLiked: false });
        });
    }
  }

  isUserLoggedIn() {
    return this.props.appContainer.me !== '';
  }

  render() {
    // if guest user
    if (!this.isUserLoggedIn()) {
      return <div></div>;
    }

    const btnSizeClassName = this.props.size ? `btn-${this.props.size}` : 'btn-md';
    const addedClassNames = [
      this.state.isLiked ? 'active' : '',
      btnSizeClassName,
    ];
    const addedClassName = addedClassNames.join(' ');

    return (
      <button
        type="button"
        href="#"
        title="Like"
        onClick={this.handleClick}
        className={`btn-like btn btn-default btn-circle btn-outline ${addedClassName}`}
      >
        <i className="icon-like"></i>
      </button>
    );
  }

}

/**
 * Wrapper component for using unstated
 */
const LikeButtonWrapper = (props) => {
  return createSubscribedElement(LikeButton, props, [AppContainer]);
};

LikeButton.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,

  pageId: PropTypes.string,
  isLiked: PropTypes.bool,
  size: PropTypes.string,
};

export default LikeButtonWrapper;
