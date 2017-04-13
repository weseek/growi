import React from 'react';
import PropTypes from 'prop-types';

import { LsxContext } from '../../util/LsxContext';
import { PageListMeta } from './PageListMeta';
import { PagePath } from './PagePath';
import { PageNode } from '../PageNode';

export class Page extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isVisible: true,
      isLinkable: false,
    };
  }

  componentDidMount() {
    // process depth option
    const optDepth = this.props.lsxContext.getOptDepth();
    if (optDepth !== undefined) {
      const depth = this.props.depth;
      const decGens = this.props.pageNode.getDecendantsGenerationsNum();

      // console.log(this.props.pageNode.page.path, `depth=${depth}`, `optDepth.end=${optDepth.end}`);

      if (optDepth.end !== undefined) {
        const isVisible = (optDepth.end > 0) ? (depth <= optDepth.end) : (decGens <= optDepth.end);
        this.setState({isVisible});
      }
    }
  }

  render() {
    if (!this.state.isVisible) {
      return <div></div>;
    }

    const pageNode = this.props.pageNode;
    const page = pageNode.page;

    const childPages = pageNode.children.map((pageNode) => {
      return (
        <Page key={pageNode.page.path} depth={this.props.depth + 1}
          pageNode={pageNode}
          lsxContext={this.props.lsxContext}
        />
      );
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
  lsxContext: PropTypes.instanceOf(LsxContext).isRequired,
  depth: PropTypes.number,
};
