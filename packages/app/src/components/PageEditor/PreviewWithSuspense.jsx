import React from 'react';
import PropTypes from 'prop-types';
import Preview from './Preview';

import { withLoadingSppiner } from '../SuspenseUtils';

function PagePreview(props) {
  if (props.markdown === '') {
    if (props.error !== '') {
      return props.error;
    }
    throw (async() => {
      await props.setMarkdown();
    })();
  }

  return (
    <div className="linkedit-preview">
      <Preview markdown={props.markdown} />
    </div>
  );
}

PagePreview.propTypes = {
  setMarkdown: PropTypes.func,
  markdown: PropTypes.string,
  error: PropTypes.string,
};

export default withLoadingSppiner(PagePreview);
