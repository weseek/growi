import React from 'react';
import PropTypes from 'prop-types';
// // [TODO] GC-1391
// import TagLabel from '../TagLabel';
import EditTagModal from './EditTagModal';

/**
 * show tag labels on view and edit tag button on edit
 * tag labels on view is not implemented yet(GC-1391)
 */
export default class TagViewer extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      // currentPageTags: [], // [TODO] GC-1391
      revisionPageTags: [],
    };

    this.sendTagData = this.sendTagData.bind(this);
  }

  async componentWillMount() {
    // set pageTag on button
    const pageId = this.props.pageId;
    if (pageId) {
      const res = await this.props.crowi.apiGet('/pages.getPageTag', { pageId });
      this.setState({
        // currentPageTags: res.tags, // [TODO] GC-1391
        revisionPageTags: res.tags,
      });
    }
  }

  sendTagData(newPageTags) {
    this.setState({ revisionPageTags: newPageTags });
    this.props.sendTagData(newPageTags);
  }

  render() {
    return (
      <span className="tag-container">
        {/* [TODO] GC-1391 */}
        {/* <TagLabel currentPageTags={this.state.currentPageTags} /> */}
        <EditTagModal crowi={this.props.crowi} currentPageTags={this.state.revisionPageTags} sendTagData={this.sendTagData} />
      </span>
    );
  }

}

TagViewer.propTypes = {
  crowi: PropTypes.object.isRequired,
  pageId: PropTypes.string,
  sendTagData: PropTypes.func,
};
