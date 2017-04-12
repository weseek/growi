import React from 'react';

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

    return (
      <li className="page-list-li">
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
  pageNode: React.PropTypes.instanceOf(PageNode).isRequired,
  options: React.PropTypes.object.isRequired,
};
