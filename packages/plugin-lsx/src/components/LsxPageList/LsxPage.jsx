import React from 'react';

import { pathUtils } from '@growi/core';
import { PageListMeta } from '@growi/ui';
import PropTypes from 'prop-types';

import { PageNode } from '../PageNode';
import { LsxContext } from '../lsx-context';

import { PagePathWrapper } from './PagePathWrapper';

export class LsxPage extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isExists: false,
      isLinkable: false,
      hasChildren: false,
    };
  }

  UNSAFE_componentWillMount() {
    const pageNode = this.props.pageNode;

    if (pageNode.page !== undefined) {
      this.setState({ isExists: true });
    }
    if (pageNode.children.length > 0) {
      this.setState({ hasChildren: true });
    }

    // process depth option
    const optDepth = this.props.lsxContext.getOptDepth();
    if (optDepth == null) {
      this.setState({ isLinkable: true });
    }
    else {
      const depth = this.props.depth;

      // debug
      // console.log(pageNode.pagePath, {depth, decGens, 'optDepth.start': optDepth.start, 'optDepth.end': optDepth.end});

      const isLinkable = optDepth.start <= depth;
      this.setState({ isLinkable });
    }
  }

  getChildPageElement() {
    const pageNode = this.props.pageNode;

    let element = '';

    // create child pages elements
    if (this.state.hasChildren) {
      const pages = pageNode.children.map((pageNode) => {
        return (
          <LsxPage
            key={pageNode.pagePath}
            depth={this.props.depth + 1}
            pageNode={pageNode}
            lsxContext={this.props.lsxContext}
            basisViewersCount={this.props.basisViewersCount}
          />
        );
      });

      element = <ul className="page-list-ul">{pages}</ul>;
    }

    return element;
  }

  getIconElement() {
    return (this.state.isExists)
      ? <i className="ti ti-agenda" aria-hidden="true"></i>
      : <i className="ti ti-file lsx-page-not-exist" aria-hidden="true"></i>;
  }

  render() {
    const { pageNode, basisViewersCount } = this.props;

    // create PagePath element
    let pagePathNode = <PagePathWrapper pagePath={pageNode.pagePath} isExists={this.state.isExists} />;
    if (this.state.isLinkable) {
      pagePathNode = <a className="page-list-link" href={encodeURI(pathUtils.removeTrailingSlash(pageNode.pagePath))}>{pagePathNode}</a>;
    }

    // create PageListMeta element
    const pageListMeta = (this.state.isExists) ? <PageListMeta page={pageNode.page} basisViewersCount={basisViewersCount} /> : '';

    return (
      <li className="page-list-li">
        <small>{this.getIconElement()}</small> {pagePathNode}
        <span className="ml-2">{pageListMeta}</span>
        {this.getChildPageElement()}
      </li>
    );
  }

}

LsxPage.propTypes = {
  pageNode: PropTypes.instanceOf(PageNode).isRequired,
  lsxContext: PropTypes.instanceOf(LsxContext).isRequired,
  depth: PropTypes.number,
  basisViewersCount: PropTypes.number,
};
