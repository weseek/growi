import React from 'react';

export default class PagePath extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      pages: [],
    };
  }

  componentWillMount() {
    let splitted = this.props.pagePath.split(/\//);
    splitted.shift();   // omit first element with shift()

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

  render() {
    const pageLength = this.state.pages.length;
    const afterElements = [];
    this.state.pages.forEach((page, index) => {
      afterElements.push(
        <span key={page.pagePath} className="path-segment">
          <a href={page.pagePath}>{page.pageName}</a>
        </span>);
      afterElements.push(
        <span key={page.pagePath+'/'} className="separator">
          <a href={page.pagePath+'/'} className={(index==pageLength-1) ? 'last-path' : ''}>/</a>
        </span>
      );
    });

    return (
      <span className="page-path">
        <span className="separator">
          <a href="/">/</a>
        </span>
        {afterElements}
      </span>
    );
  }
}

PagePath.propTypes = {
  pagePath: React.PropTypes.string.isRequired,
};
