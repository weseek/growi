import React from 'react';

import PropTypes from 'prop-types';

// TODO: Omit withLoadingSppiner
import { withLoadingSppiner } from '../SuspenseUtils';

import Preview from './Preview';

function PagePreview(props) {
  if (props.markdown == null || props.pagePath == null) {
    if (props.error !== '') {
      return props.error;
    }
    throw (async() => {
      await props.setMarkdown();
    })();
  }

  return (
    <div className="linkedit-preview">
      <Preview markdown={props.markdown} pagePath={props.pagePath} />
    </div>
  );
}

PagePreview.propTypes = {
  setMarkdown: PropTypes.func,
  markdown: PropTypes.string,
  pagePath: PropTypes.string,
  error: PropTypes.string,
};

export default withLoadingSppiner(PagePreview);
