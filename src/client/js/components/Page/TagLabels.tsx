import React, { useCallback, useState } from 'react';
// import PropTypes from 'prop-types';

import { toastSuccess, toastError } from '../../util/apiNotification';

// import { withUnstatedContainers } from '../UnstatedUtils';
import AppContainer from '../../services/AppContainer';

import RenderTagLabels from './RenderTagLabels';
import TagEditModal from './TagEditModal';
import { useCurrentPageSWR, useCurrentPageTagsSWR } from '~/stores/page';
import { useCurrentUser } from '~/stores/context';
import { apiPost } from '~/client/js/util/apiv1-client';

type Props = {
  appContainer: AppContainer,
  editorMode: string,
  // editorContainer: EditorContainer,
}

const TagLabels = (props: Props): JSX.Element => {
  const [isTagEditModalShown, setIsTagEditModalShown] = useState(false);

  const { data: currentUser } = useCurrentUser();
  const { data: tags, error, mutate: currentPageTagsMutate } = useCurrentPageTagsSWR();
  const { data: currentPage } = useCurrentPageSWR();
  // console.log(tags);

  const openEditorModal = useCallback(() => {
    setIsTagEditModalShown(true);
  }, []);

  const closeEditorModal = useCallback(() => {
    setIsTagEditModalShown(false);
  }, []);
  const tagsUpdatedHandler = useCallback(async(newTags) => {
    const pageId = currentPage.id;
    // TODO impl this after editorMode becomes available.
    // It will not be reflected in the DB until the page is refreshed
    // if (props.editorMode === 'edit') {
    //   return props.editorContainer.setState({ tags: 'jou' });
    // }

    try {
      await apiPost('/tags.update', { pageId, tags: newTags });
      currentPageTagsMutate();

      // TODO impl this after editorMode becomes available.
      // update editorContainer.state
      // props.editorContainer.setState({ tags });
      toastSuccess('updated tags successfully');
    }
    catch (err) {
      toastError(err, 'fail to update tags');
    }
  }, [currentPageTagsMutate, currentPage.id]);

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

  // constructor(props) {
  //   super(props);

  // this.state = {
  //   isTagEditModalShown: false,
  // };

  // this.openEditorModal = this.openEditorModal.bind(this);
  // this.closeEditorModal = this.closeEditorModal.bind(this);
  // this.tagsUpdatedHandler = this.tagsUpdatedHandler.bind(this);
  // }

  /**
   * @return tags data
   *   1. pageContainer.state.tags if editorMode is view
   *   2. editorContainer.state.tags if editorMode is edit
   */
  // getTagData() {
  // const { editorContainer, editorMode } = this.props;
  // return (editorMode === 'edit') ? editorContainer.state.tags : pageContainer.state.tags;
  //   return [];
  // }

  // openEditorModal() {
  //   this.setState({ isTagEditModalShown: true });
  // }

  // closeEditorModal() {
  //   this.setState({ isTagEditModalShown: false });
  // }

  // async tagsUpdatedHandler(newTags) {
  //   const {
  //     appContainer, editorMode,
  //   } = this.props;

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
  // }


  // render() {
  //   return null;
  // }

}

/**
 * Wrapper component for using unstated
 */
// const TagLabelsWrapper = withUnstatedContainers(DeprecatedTagLabels, [AppContainer]);

// DeprecatedTagLabels.propTypes = {
// t: PropTypes.func.isRequired, // i18next

// appContainer: PropTypes.instanceOf(AppContainer).isRequired,
// pageContainer: PropTypes.instanceOf(PageContainer).isRequired,
// editorContainer: PropTypes.instanceOf(EditorContainer).isRequired,

// editorMode: PropTypes.string.isRequired,
// };

// export default withTranslation()(TagLabelsWrapper);
