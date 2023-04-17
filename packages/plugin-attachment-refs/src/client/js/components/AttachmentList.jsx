import React from 'react';

import { Attachment } from '@growi/ui/dist/components/Attachment';
import axios from 'axios'; // import axios from growi dependencies
import PropTypes from 'prop-types';

// eslint-disable-next-line import/no-unresolved

import RefsContext from '../util/RefsContext';
import TagCacheManagerFactory from '../util/TagCacheManagerFactory';

// eslint-disable-next-line no-unused-vars

import ExtractedAttachments from './ExtractedAttachments';

import styles from '../../css/index.css';

const AttachmentLink = Attachment;

export default class AttachmentList extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isLoading: false,
      isLoaded: false,
      isError: false,
      errorMessage: null,

      attachments: [],
    };

    this.tagCacheManager = TagCacheManagerFactory.getInstance();
  }

  async UNSAFE_componentWillMount() {
    const { refsContext } = this.props;

    // get state object cache
    const stateCache = this.tagCacheManager.getStateCache(refsContext);

    // check cache exists
    if (stateCache != null) {
      // restore state
      this.setState({
        ...stateCache,
        isLoading: false,
      });
      // parse with no effect
      try {
        refsContext.parse();
      }
      catch (err) {
        // do nothing
      }

      return; // go to render()
    }

    // parse
    try {
      refsContext.parse();
    }
    catch (err) {
      this.setState({
        isError: true,
        errorMessage: err.toString(),
      });

      // store to sessionStorage
      this.tagCacheManager.cacheState(refsContext, this.state);

      return;
    }

    this.loadContents();
  }

  async loadContents() {
    const { refsContext } = this.props;

    let res;
    try {
      this.setState({ isLoading: true });

      if (refsContext.isSingle) {
        res = await axios.get('/_api/plugin/ref', {
          params: {
            pagePath: refsContext.pagePath,
            fileNameOrId: refsContext.fileNameOrId,
            options: refsContext.options,
          },
        });
        this.setState({
          attachments: [res.data.attachment],
        });
      }
      else {
        res = await axios.get('/_api/plugin/refs', {
          params: {
            prefix: refsContext.prefix,
            pagePath: refsContext.pagePath,
            options: refsContext.options,
          },
        });
        this.setState({
          attachments: res.data.attachments,
        });
      }

      this.setState({
        isLoaded: true,
      });
    }
    catch (err) {
      this.setState({
        isError: true,
        errorMessage: err.response.data,
      });

      return;
    }
    finally {
      this.setState({ isLoading: false });

      // store to sessionStorage
      this.tagCacheManager.cacheState(refsContext, this.state);
    }

  }

  renderNoAttachmentsMessage() {
    const { refsContext } = this.props;

    let message;

    if (refsContext.prefix != null) {
      message = `${refsContext.prefix} and descendant pages have no attachments`;
    }
    else {
      message = `${refsContext.pagePath} has no attachments`;
    }

    return (
      <div className="text-muted">
        <small>
          <i className="fa fa-fw fa-info-circle" aria-hidden="true"></i>
          {message}
        </small>
      </div>
    );
  }

  renderContents() {
    const { refsContext } = this.props;

    if (this.state.isLoading) {
      return (
        <div className="text-muted">
          <i className="fa fa-spinner fa-pulse mr-1"></i>
          <span className="attachment-refs-blink">{refsContext.tagExpression}</span>
        </div>
      );
    }
    if (this.state.errorMessage != null) {
      return (
        <div className="text-warning">
          <i className="fa fa-exclamation-triangle fa-fw"></i>
          {refsContext.tagExpression} (-&gt; <small>{this.state.errorMessage}</small>)
        </div>
      );
    }

    if (this.state.isLoaded) {
      const { attachments } = this.state;

      // no attachments
      if (attachments.length === 0) {
        return this.renderNoAttachmentsMessage();
      }

      return (refsContext.isExtractImg)
        ? <ExtractedAttachments attachments={attachments} refsContext={refsContext} />
        : attachments.map((attachment) => {
          return <AttachmentLink key={attachment._id} attachment={attachment} />;
        });
    }
  }

  render() {
    return <div className="attachment-refs">{this.renderContents()}</div>;
  }

}

AttachmentList.propTypes = {
  refsContext: PropTypes.instanceOf(RefsContext).isRequired,
};
