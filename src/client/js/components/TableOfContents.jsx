import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

import PageContainer from '../services/PageContainer';

import { createSubscribedElement } from './UnstatedUtils';

/**
 * @author Yuki Takei <yuki@weseek.co.jp>
 *
 * @export
 * @class TableOfContents
 * @extends {React.Component}
 */
class TableOfContents extends React.Component {

  render() {
    const { tocHtml } = this.props.pageContainer.state;

    return (
      <div
        id="revision-toc-content"
        className="revision-toc-content"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: tocHtml,
        }}
      />
    );
  }

}

/**
 * Wrapper component for using unstated
 */
const TableOfContentsWrapper = (props) => {
  return createSubscribedElement(TableOfContents, props, [PageContainer]);
};

TableOfContents.propTypes = {
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,
};

export default withTranslation()(TableOfContentsWrapper);
