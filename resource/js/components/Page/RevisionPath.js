import React from 'react';
import PropTypes from 'prop-types';

import CopyButton from '../CopyButton';

export default class RevisionPath extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      pages: [],
      isListPage: false,
      isLinkToListPage: true,
    };
  }

  componentWillMount() {
    // whether list page or not
    const isListPage = this.props.pagePath.match(/\/$/);
    this.setState({ isListPage });

    // whether set link to '/'
    const behaviorType = this.props.crowi.getConfig()['behaviorType'];
    const isLinkToListPage = ('crowi-plus' !== behaviorType);
    this.setState({ isLinkToListPage });

    // generate pages obj
    let splitted = this.props.pagePath.split(/\//);
    splitted.shift();   // omit first element with shift()
    if (splitted[splitted.length-1] === '') {
      splitted.pop();   // omit last element with unshift()
    }

    let pages = [];
    let parentPath = '/';
    splitted.forEach((pageName) => {
      pages.push({
        pagePath: parentPath + pageName,
        pageName: pageName,
      });
      parentPath += pageName + '/';
    });

    this.setState({ pages });
  }

  showToolTip() {
    $('#btnCopy').tooltip('show');
    setTimeout(() => {
      $('#btnCopy').tooltip('hide');
    }, 1000);
  }

  generateLinkElementToListPage(pagePath, isLinkToListPage, isLastElement) {
    if (isLinkToListPage) {
      return <a href={pagePath+'/'} className={(isLastElement && !this.state.isListPage) ? 'last-path' : ''}>/</a>;
    }
    else if (!isLastElement) {
      return <span className="text-primary">/</span>;
    }
    else {
      return <span></span>
    }
  }

  render() {
    // define styles
    const rootStyle = {
      marginRight: "0.2em",
    }
    const separatorStyle = {
      marginLeft: "0.2em",
      marginRight: "0.2em",
    }
    const editButtonStyle = {
      fontSize: "0.6em",
      marginLeft: "0.5em",
      padding: "0 2px",
      border: 'none',
    };

    const pageLength = this.state.pages.length;

    const afterElements = [];
    this.state.pages.forEach((page, index) => {
      const isLastElement = (index == pageLength-1);

      // add elements for page
      afterElements.push(
        <span key={page.pagePath} className="path-segment">
          <a href={page.pagePath}>{page.pageName}</a>
        </span>);

      // add elements for '/'
      afterElements.push(
        <span key={page.pagePath+'/'} className="separator" style={separatorStyle}>
          {this.generateLinkElementToListPage(page.pagePath, this.state.isLinkToListPage, isLastElement)}
        </span>
      );
    });

    return (
      <span>
        <span className="separator" style={rootStyle}>
          <a href="/">/</a>
        </span>
        {afterElements}
        <CopyButton buttonId="btnCopyRevisionPath" text={this.props.pagePath}
            buttonClassName="btn btn-default btn-muted" iconClassName="fa fa-clone text-muted" />
        <a href="#edit-form" className="btn btn-default btn-muted" style={editButtonStyle}>
          <i className="fa fa-edit text-muted"></i>
        </a>
      </span>
    );
  }
}

RevisionPath.propTypes = {
  pagePath: PropTypes.string.isRequired,
  crowi: PropTypes.object.isRequired,
};
