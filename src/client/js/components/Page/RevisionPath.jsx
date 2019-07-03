import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

import CopyDropdown from './CopyDropdown';

class RevisionPath extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      pages: [],
      isListPage: false,
      isLinkToListPage: true,
    };

    // retrieve xss library from window
    this.xss = window.xss;
  }

  componentWillMount() {
    // whether list page or not
    const isListPage = this.props.pagePath.match(/\/$/);
    this.setState({ isListPage });

    // whether set link to '/'
    const { behaviorType } = this.props;
    const isLinkToListPage = (behaviorType === 'crowi');
    this.setState({ isLinkToListPage });

    // generate pages obj
    const splitted = this.props.pagePath.split(/\//);
    splitted.shift(); // omit first element with shift()
    if (splitted[splitted.length - 1] === '') {
      splitted.pop(); // omit last element with unshift()
    }

    const pages = [];
    let parentPath = '/';
    splitted.forEach((pageName) => {
      pages.push({
        pagePath: parentPath + encodeURIComponent(pageName),
        pageName: this.xss.process(pageName),
      });
      parentPath += `${pageName}/`;
    });

    this.setState({ pages });
  }

  showToolTip() {
    const buttonId = '#copyPagePathDropdown';
    $(buttonId).tooltip('show');
    setTimeout(() => {
      $(buttonId).tooltip('hide');
    }, 1000);
  }

  generateLinkElementToListPage(pagePath, isLinkToListPage, isLastElement) {
    /* eslint-disable no-else-return */
    if (isLinkToListPage) {
      return <a href={`${pagePath}/`} className={(isLastElement && !this.state.isListPage) ? 'last-path' : ''}>/</a>;
    }
    else if (!isLastElement) {
      return <span>/</span>;
    }
    else {
      return <span></span>;
    }
    /* eslint-enable no-else-return */
  }

  render() {
    // define styles
    const rootStyle = {
      marginRight: '0.2em',
    };
    const separatorStyle = {
      marginLeft: '0.2em',
      marginRight: '0.2em',
    };
    const buttonStyle = {
      marginLeft: '0.5em',
      padding: '0 2px',
    };

    const pageLength = this.state.pages.length;

    const afterElements = [];
    this.state.pages.forEach((page, index) => {
      const isLastElement = (index === pageLength - 1);

      // add elements for page
      afterElements.push(
        <span key={page.pagePath} className="path-segment">
          <a href={page.pagePath}>{page.pageName}</a>
        </span>,
      );

      // add elements for '/'
      afterElements.push(
        <span key={`${page.pagePath}/`} className="separator" style={separatorStyle}>
          {this.generateLinkElementToListPage(page.pagePath, this.state.isLinkToListPage, isLastElement)}
        </span>,
      );
    });

    return (
      <span className="d-flex align-items-center">
        <span className="separator" style={rootStyle}>
          <a href="/">/</a>
        </span>
        {afterElements}

        <CopyDropdown t={this.props.t} pagePath={this.props.pagePath} pageId={this.props.pageId} buttonStyle={buttonStyle}></CopyDropdown>

        <a href="#edit" className="btn btn-default btn-edit" style={buttonStyle}>
          <i className="icon-note" />
        </a>
      </span>
    );
  }

}

RevisionPath.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  behaviorType: PropTypes.string.isRequired,
  pagePath: PropTypes.string.isRequired,
  pageId: PropTypes.string,
};

export default withTranslation()(RevisionPath);
