import React from 'react';
import PropTypes from 'prop-types';

import { PageListMeta } from './PageListMeta';
import { PagePath } from './PagePath';
import { PageNode } from '../PageNode';

export class Page extends React.Component {

  render() {
    const pageNode = this.props.pageNode;
    const page = pageNode.page;

    const childPages = pageNode.children.map((pageNode) => {
      return <Page pageNode={pageNode} options={this.props.options} />;
    });
    const icon = (pageNode.children.length > 0) ?
      <i className="fa fa-folder" aria-hidden="true"></i>:
      <i className="fa fa-file-text-o" aria-hidden="true"></i>;

    return (
      <li className="page-list-li">
        <small>{icon}</small>
        <a className="page-list-link" href={page.path}>
          <PagePath page={page}/>
        </a>
        <PageListMeta page={page} />
        <ul className="page-list-ul">{childPages}</ul>
      </li>
    );
  }
}

Page.propTypes = {
  pageNode: PropTypes.instanceOf(PageNode).isRequired,
  options: PropTypes.object.isRequired,
};
