import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';

import { toastSuccess, toastError } from '../../util/apiNotification';

import { withUnstatedContainers } from '../UnstatedUtils';
import AppContainer from '../../services/AppContainer';

import RenderTagLabels from './RenderTagLabels';
import TagEditModal from './TagEditModal';
import { useCurrentPageTagsSWR } from '~/stores/page';
import { useCurrentUser } from '~/stores/context';

type Props = {
  appContainer: AppContainer,
  editorMode: string,
}

const TagLabels = (props: Props): JSX.Element => {
  const [isTagEditModalShown, setIsTagEditModalShown] = useState(false);

  const { data: currentUser } = useCurrentUser();
  const { data: tags, error } = useCurrentPageTagsSWR();

  const openEditorModal = useCallback(() => {
    setIsTagEditModalShown(true);
  }, []);

  const closeEditorModal = useCallback(() => {
    setIsTagEditModalShown(false);
  }, []);
  // TODO: impl by https://youtrack.weseek.co.jp/issue/GW-4960
  const tagsUpdatedHandler = useCallback(() => {
  }, []);

  const isLoading = !error && !tags;

  // loading
  if (isLoading) {
    return (
      <form className="grw-tag-labels form-inline">
        <i className="tag-icon icon-tag mr-2"></i>
        <span className="grw-tag-label badge badge-secondary">―</span>
      </form>
    );
  }

  const { appContainer } = props;
  const isGuestUser = currentUser == null;

  return (
    <>
      <form className="grw-tag-labels form-inline">
        <i className="tag-icon icon-tag mr-2"></i>
        <RenderTagLabels
          tags={tags}
          openEditorModal={openEditorModal}
          isGuestUser={isGuestUser}
        />
      </form>

      <TagEditModal
        tags={tags}
        isOpen={isTagEditModalShown}
        onClose={closeEditorModal}
        appContainer={appContainer}
        onTagsUpdated={tagsUpdatedHandler}
      />
    </>
  );
};

export default TagLabels;

// TODO: remove old code (https://youtrack.weseek.co.jp/issue/GW-4961)
class DeprecatedTagLabels extends React.Component {

  constructor(props) {
    super(props);

    // this.state = {
    //   isTagEditModalShown: false,
    // };

    // this.openEditorModal = this.openEditorModal.bind(this);
    // this.closeEditorModal = this.closeEditorModal.bind(this);
    this.tagsUpdatedHandler = this.tagsUpdatedHandler.bind(this);
  }

  /**
   * @return tags data
   *   1. pageContainer.state.tags if editorMode is view
   *   2. editorContainer.state.tags if editorMode is edit
   */
  getTagData() {
    // const { editorContainer, editorMode } = this.props;
    // return (editorMode === 'edit') ? editorContainer.state.tags : pageContainer.state.tags;
    return [];
  }

  // openEditorModal() {
  //   this.setState({ isTagEditModalShown: true });
  // }

  // closeEditorModal() {
  //   this.setState({ isTagEditModalShown: false });
  // }

  async tagsUpdatedHandler(newTags) {
    const {
      appContainer, editorMode,
    } = this.props;

    // const { pageId } = pageContainer.state;

    // // It will not be reflected in the DB until the page is refreshed
    // if (editorMode === 'edit') {
    //   return editorContainer.setState({ tags: newTags });
    // }

    // try {
    //   const { tags } = await appContainer.apiPost('/tags.update', { pageId, tags: newTags });

    //   // update pageContainer.state
    //   pageContainer.setState({ tags });
    //   // update editorContainer.state
    //   editorContainer.setState({ tags });

    //   toastSuccess('updated tags successfully');
    // }
    // catch (err) {
    //   toastError(err, 'fail to update tags');
    // }
  }


  render() {
    return null;
  }

}

/**
 * Wrapper component for using unstated
 */
const TagLabelsWrapper = withUnstatedContainers(DeprecatedTagLabels, [AppContainer]);

DeprecatedTagLabels.propTypes = {
  t: PropTypes.func.isRequired, // i18next

  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  // pageContainer: PropTypes.instanceOf(PageContainer).isRequired,
  // editorContainer: PropTypes.instanceOf(EditorContainer).isRequired,

  editorMode: PropTypes.string.isRequired,
};

// export default withTranslation()(TagLabelsWrapper);
