import React, { Suspense } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';


import { withUnstatedContainers } from '../UnstatedUtils';
import AppContainer from '~/client/services/AppContainer';

import RenderTagLabels from './RenderTagLabels';
import TagEditModal from './TagEditModal';

class TagLabels extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isTagEditModalShown: false,
    };

    this.openEditorModal = this.openEditorModal.bind(this);
    this.closeEditorModal = this.closeEditorModal.bind(this);
  }


  openEditorModal() {
    this.setState({ isTagEditModalShown: true });
  }

  closeEditorModal() {
    this.setState({ isTagEditModalShown: false });
  }


  render() {
    const { appContainer, tagsUpdateInvoked, tags } = this.props;

    return (
      <>

        <form className="grw-tag-labels form-inline">
          <i className="tag-icon icon-tag mr-2"></i>
          <Suspense fallback={<span className="grw-tag-label badge badge-secondary">―</span>}>
            <RenderTagLabels
              tags={tags}
              openEditorModal={this.openEditorModal}
              isGuestUser={appContainer.isGuestUser}
            />
          </Suspense>
        </form>

        <TagEditModal
          tags={tags}
          isOpen={this.state.isTagEditModalShown}
          onClose={this.closeEditorModal}
          appContainer={this.props.appContainer}
          onTagsUpdated={tagsUpdateInvoked}
        />

      </>
    );
  }

}

/**
 * Wrapper component for using unstated
 */
const TagLabelsUnstatedWrapper = withUnstatedContainers(TagLabels, [AppContainer]);

TagLabels.propTypes = {
  t: PropTypes.func.isRequired, // i18next

  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  tags: PropTypes.arrayOf(PropTypes.object).isRequired,
  tagsUpdateInvoked: PropTypes.func,
};

// wrapping tsx component returned by withUnstatedContainers to avoid type error when this component used in other tsx components.
const TagLabelsWrapper = (props) => {
  return <TagLabelsUnstatedWrapper {...props}></TagLabelsUnstatedWrapper>;
};
export default withTranslation()(TagLabelsWrapper);
