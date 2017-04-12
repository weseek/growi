import React from 'react';

import { Page } from './Page';
import { PageNode } from '../PageNode';

export class ListView extends React.Component {

  render() {
    const listView = this.props.nodeTree.map((pageNode) => {
      return <Page pageNode={pageNode} options={this.props.options} />;
    });

    return (
      <div className="page-list">
        <ul className="page-list-ul">
        {listView}
        </ul>
      </div>
    );
  }
}

ListView.propTypes = {
  nodeTree: React.PropTypes.arrayOf(PageNode).isRequired,
  options: React.PropTypes.object.isRequired,
};
