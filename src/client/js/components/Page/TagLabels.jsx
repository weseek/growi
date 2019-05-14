import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import TagEditor from './TagEditor';

class TagLabels extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      tags: [],
    };

    this.showEditor = this.showEditor.bind(this);
    this.tagsUpdatedHandler = this.tagsUpdatedHandler.bind(this);
  }

  async componentWillMount() {
    // set pageTag on button
    const pageId = this.props.pageId;
    const templateTags = this.props.templateTags;
    if (pageId) {
      const res = await this.props.crowi.apiGet('/pages.getPageTag', { pageId });
      this.setState({ tags: res.tags });
      this.props.sendTagData(res.tags);
    }
    else if (templateTags) {
      this.setState({ tags: templateTags });
      this.props.sendTagData(templateTags);
    }
  }

  showEditor() {
    this.tagEditor.show(this.state.tags);
  }

  tagsUpdatedHandler(tags) {
    this.setState({ tags });
    this.props.sendTagData(tags);
  }

  render() {
    const tagElements = [];
    const { t, pageId } = this.props;

    for (let i = 0; i < this.state.tags.length; i++) {
      tagElements.push(
        <span key={`${pageId}_${i}`} className="text-muted">
          <i className="tag-icon icon-tag mr-1"></i>
          <a className="tag-name mr-2" href={`/_search?q=tag:${this.state.tags[i]}`} key={i.toString()}>{this.state.tags[i]}</a>
        </span>,
      );

    }

    return (
      <div className="tag-viewer">
        {this.state.tags.length === 0 && (
          <a className="btn btn-link btn-edit-tags no-tags p-0" onClick={this.showEditor}>
            { t('Add tags for this page') } <i className="manage-tags ml-2 icon-plus"></i>
          </a>
        )}
        {tagElements}
        {this.state.tags.length > 0 && (
          <a className="btn btn-link btn-edit-tags p-0" onClick={this.showEditor}>
            <i className="manage-tags ml-2 icon-plus"></i> { t('Edit tags for this page') }
          </a>
        )}

        <TagEditor
          ref={(c) => { this.tagEditor = c }}
          crowi={this.props.crowi}
          pageId={this.props.pageId}
          onTagsUpdated={this.tagsUpdatedHandler}
        >
        </TagEditor>
      </div>
    );
  }

}

TagLabels.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  crowi: PropTypes.object.isRequired,
  pageId: PropTypes.string,
  sendTagData: PropTypes.func.isRequired,
  templateTags: PropTypes.string,
};

export default withTranslation()(TagLabels);
