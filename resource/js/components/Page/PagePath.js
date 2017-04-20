import React from 'react';
import CopyButton from '../CopyButton';

export default class PagePath extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      pages: [],
      isListPage: false,
    };
  }

  componentWillMount() {
    // whether list page or not
    const isListPage = this.props.pagePath.match(/\/$/);
    this.setState({ isListPage });

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

  render() {
    const pageLength = this.state.pages.length;

    const afterElements = [];
    this.state.pages.forEach((page, index) => {
      const isLastElement = (index == pageLength-1);

      // add elements
      afterElements.push(
        <span key={page.pagePath} className="path-segment">
          <a href={page.pagePath}>{page.pageName}</a>
        </span>);
      afterElements.push(
        <span key={page.pagePath+'/'} className="separator">
          <a href={page.pagePath+'/'} className={(isLastElement && !this.state.isListPage) ? 'last-path' : ''}>/</a>
        </span>
      );
    });

    return (
      <span className="page-path">
        <span className="separator">
          <a href="/">/</a>
        </span>
        {afterElements}
        <CopyButton buttonClassName="btn btn-default" text={this.props.pagePath} iconClassName="fa fa-clone text-muted" />
      </span>
    );
  }
}

PagePath.propTypes = {
  pagePath: React.PropTypes.string.isRequired,
};
