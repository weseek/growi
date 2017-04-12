import React from 'react';

import { Page } from './Page';
import { PageNode } from '../PageNode';

import { LsxContext } from '../../util/LsxContext';

export class ListView extends React.Component {

  render() {
    const listView = this.props.nodeTree.map((pageNode) => {
      return <Page pageNode={pageNode} options={this.props.options} />;
    });

    // no contents
    if (this.props.nodeTree.length == 0) {
      return <div className="text-muted">
          <small>
            <i className="fa fa-fw fa-info-circle" aria-hidden="true"></i>
            $lsx(<a href={this.props.lsxContext.pagePath}>{this.props.lsxContext.pagePath}</a>) has no contents
          </small>
        </div>;
    }

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
  lsxContext: React.PropTypes.instanceOf(LsxContext).isRequired,
};
