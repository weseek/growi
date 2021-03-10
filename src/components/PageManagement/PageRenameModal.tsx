import { useState, FC } from 'react';
import { useForm } from 'react-hook-form';
import { pathUtils } from 'growi-commons';
import {
  Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';

import { toastSuccess } from '~/client/js/util/apiNotification';
import { useTranslation } from '~/i18n';

import { useCurrentPageSWR } from '~/stores/page';

import { Page as IPage } from '~/interfaces/page';

import { ApiErrorMessageList } from '~/components/PageManagement/ApiErrorMessageList';
import { PagePathAutoComplete } from '~/components/PagePathAutoComplete';
import { useCurrentPagePath, useSearchServiceReachable, useSiteUrl } from '~/stores/context';


// import { withUnstatedContainers } from '../../client/js/components/UnstatedUtils';
// import { toastError } from '../../client/js/util/apiNotification';

// import PageContainer from '../../client/js/services/PageContainer';
// import ComparePathsTable from '../../client/js/components/ComparePathsTable';
// import DuplicatedPathsTable from '../../client/js/components/DuplicatedPathsTable';

type Props = {
  currentPage: IPage;
  isOpen: boolean,
  path?: string,
  onClose:() => void,
  onMutateCurrentPage?:()=>void;
  onInputChange?: (string) => void,
  initializedPath?: string,
  addTrailingSlash?: boolean,
  onSubmit?: () => void,
  keyword?: string,
}

const PageRenameModal:FC<Props> = (props:Props) => {
  const { register, handleSubmit } = useForm();

  const { t } = useTranslation();
  const { mutate: mutateCurrentPage } = useCurrentPageSWR();

  const { data: siteUrl } = useSiteUrl();
  const { data: currentPagePath } = useCurrentPagePath();
  const { data: isReachable } = useSearchServiceReachable();
  const [pageNameInput, setPageNameInput] = useState(currentPagePath);

  const [errs, setErrs] = useState([]);
  const [searchError, setSearchError] = useState(null);

  const {
    addTrailingSlash, onSubmit, onInputChange, currentPage,
  } = props;

  // TODO imprv submitHandler by GW 5088
  // const submitHandler = (data) => {
  //   alert(JSON.stringify(data));
  // };

  function submitHandler() {
    if (onSubmit == null) {
      return;
    }
    onSubmit();
  }

  function ppacInputChangeHandler(value) {
    setErrs([]);
    setPageNameInput(value);
  }

  function inputChangeHandler(pages) {
    if (onInputChange == null) {
      return;
    }
    const page = pages[0]; // should be single page selected

    if (page != null) {
      onInputChange(page.path);
    }
  }

  function loadLatestRevision() {
    props.onClose();
    mutateCurrentPage();
    toastSuccess(t('retrieve_again'));
  }

  function getKeywordOnInit(path) {
    return addTrailingSlash
      ? pathUtils.addTrailingSlash(path)
      : pathUtils.removeTrailingSlash(path);
  }
  const emptyLabel = (searchError !== null)
    ? 'Error on searching.'
    : t('search.search page bodies');

  return (
    <Modal size="lg" isOpen={props.isOpen} toggle={props.onClose} autoFocus={false}>
      <ModalHeader tag="h4" toggle={props.onClose} className="bg-primary text-light">
        { t('modal_rename.label.Move/Rename page') }
      </ModalHeader>
      <ModalBody>
        <div className="form-group">
          <label>{ t('modal_rename.label.Current page name') }</label><br />
          <code>{ currentPage.path }</code>
        </div>
        <div className="form-group">
          <label htmlFor="newPageName">{ t('modal_rename.label.New page name') }</label><br />
          <div className="input-group">
            <div className="input-group-prepend">
              <span className="input-group-text">{siteUrl}</span>
            </div>
            {/* TODO imprv submitHandler by GW 5088 */}
            {/* <form className="flex-fill" onSubmit={(e) => { e.preventDefault(); rename() }}> */}
            {/* <form className="flex-fill" onSubmit={handleSubmit(submitHandler)}> */}
            {/* TODO: using PagePathAutoComplete not SearchTypeahead by GW 5194 */}
            <div className="flex-fill">
              {isReachable
              ? (
                <PagePathAutoComplete
                  initializedPath={currentPagePath}
                  onSubmit={submitHandler}
                  onInputChange={ppacInputChangeHandler}
                  autoFocus
                />
              )
              : (
                <input
                  type="text"
                  value={pageNameInput}
                  className="form-control"
                  onChange={e => inputChangeHandler(e.target.value)}
                  required
                />
              )}
            </div>
            {/* </form> */}
          </div>
        </div>
        <div className="custom-control custom-checkbox custom-checkbox-warning">
          <input
            className="custom-control-input"
            name="recursively"
            id="cbRenameRecursively"
            type="checkbox"
            // checked={isRenameRecursively}
            // onChange={changeIsRenameRecursivelyHandler}
            ref={register}
          />
          <label className="custom-control-label" htmlFor="cbRenameRecursively">
            { t('modal_rename.label.Recursively') }
            <p className="form-text text-muted mt-0">{ t('modal_rename.help.recursive') }</p>
          </label>

          {/* {existingPaths.length !== 0 && (
          <div
            className="custom-control custom-checkbox custom-checkbox-warning"
          >
            <input
              className="custom-control-input"
              name="withoutExistRecursively"
              id="cbRenamewithoutExistRecursively"
              type="checkbox"
              // ref={register}
            />
            <label className="custom-control-label" htmlFor="cbRenamewithoutExistRecursively">
              { t('modal_rename.label.Rename without exist path') }
            </label>
          </div>
          )}
          {isRenameRecursively && <ComparePathsTable subordinatedPages={subordinatedPages} newPagePath={pageNameInput} />}
            {isRenameRecursively && existingPaths.length !== 0 && <DuplicatedPathsTable existingPaths={existingPaths} oldPagePath={pageNameInput} />} */}
        </div>

        <div className="custom-control custom-checkbox custom-checkbox-success">
          <input
            className="custom-control-input"
            name="create_redirect"
            id="cbRenameRedirect"
            type="checkbox"
            // checked={isRenameRedirect}
            // onChange={changeIsRenameRedirectHandler}
            ref={register}
          />
          <label className="custom-control-label" htmlFor="cbRenameRedirect">
            { t('modal_rename.label.Redirect') }
            <p className="form-text text-muted mt-0">{ t('modal_rename.help.redirect') }</p>
          </label>
        </div>

        <div className="custom-control custom-checkbox custom-checkbox-primary">
          <input
            className="custom-control-input"
            name="remain_metadata"
            id="cbRenameMetadata"
            type="checkbox"
            // checked={isRenameMetadata}
            // onChange={changeIsRenameMetadataHandler}
            ref={register}
          />
          <label className="custom-control-label" htmlFor="cbRenameMetadata">
            { t('modal_rename.label.Do not update metadata') }
            <p className="form-text text-muted mt-0">{ t('modal_rename.help.metadata') }</p>
          </label>
        </div>
        {/* <div> {subordinatedError} </div> */}
      </ModalBody>
      <ModalFooter>
        <ApiErrorMessageList errs={errs} targetPath={currentPage.path} onLoadLatestRevision={loadLatestRevision} />
        <button
          type="button"
          className="btn btn-primary"
          //  TODO enable rename by GW 5088
          // onClick={rename}
          // disabled={(isRenameRecursively && !isRenameRecursivelyWithoutExistPath && existingPaths.length !== 0)}
        >Rename
        </button>
      </ModalFooter>
    </Modal>
  );
};

export default PageRenameModal;
