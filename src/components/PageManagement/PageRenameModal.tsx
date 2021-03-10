import { useState, FC } from 'react';
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

import { ComparePathsTable } from '~/components/PageManagement/ComparePathsTable';
import { DuplicatedPathsTable } from '~/components/PageManagement/DuplicatedPathsTable';

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
  const { t } = useTranslation();
  const { mutate: mutateCurrentPage } = useCurrentPageSWR();

  const { data: siteUrl } = useSiteUrl();
  const { data: currentPagePath } = useCurrentPagePath();
  const { data: isReachable } = useSearchServiceReachable();

  const [pageNameInput, setPageNameInput] = useState(currentPagePath || '');

  const [errs, setErrs] = useState([]);

  const [subordinatedPages, setSubordinatedPages] = useState([]);
  const [existingPaths, setExistingPaths] = useState([]);
  const [isRenameRecursively, setIsRenameRecursively] = useState(true);
  const [isRenameRedirect, setIsRenameRedirect] = useState(false);
  const [isRenameMetadata, setIsRenameMetadata] = useState(false);

  if (currentPagePath == null) {
    return null;
  }

  const {
    onSubmit, currentPage,
  } = props;

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

  function inputChangeHandler(value) {
    setErrs([]);
    setPageNameInput(value);
  }

  function loadLatestRevision() {
    props.onClose();
    mutateCurrentPage();
    toastSuccess(t('retrieve_again'));
  }

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
          </div>
        </div>
        <div className="custom-control custom-checkbox custom-checkbox-warning">
          <input
            className="custom-control-input"
            id="cbRenameRecursively"
            type="checkbox"
            checked={isRenameRecursively}
            onChange={() => setIsRenameRecursively(!isRenameRecursively)}
          />
          <label className="custom-control-label" htmlFor="cbRenameRecursively">
            { t('modal_rename.label.Recursively') }
            <p className="form-text text-muted mt-0">{ t('modal_rename.help.recursive') }</p>
          </label>

          {existingPaths.length !== 0 && (
          <div
            className="custom-control custom-checkbox custom-checkbox-warning"
          >
            <input
              className="custom-control-input"
              id="cbRenamewithoutExistRecursively"
              type="checkbox"
            />
            <label className="custom-control-label" htmlFor="cbRenamewithoutExistRecursively">
              { t('modal_rename.label.Rename without exist path') }
            </label>
          </div>
          )}
          {isRenameRecursively && <ComparePathsTable currentPagePath={currentPagePath} subordinatedPages={subordinatedPages} newPagePath={pageNameInput} />}
          {isRenameRecursively && existingPaths.length !== 0
            && <DuplicatedPathsTable currentPagePath={currentPagePath} existingPaths={existingPaths} oldPagePath={pageNameInput} />}
        </div>

        <div className="custom-control custom-checkbox custom-checkbox-success">
          <input
            className="custom-control-input"
            id="cbRenameRedirect"
            type="checkbox"
            checked={isRenameRedirect}
            onChange={() => setIsRenameRedirect(!isRenameRedirect)}
          />
          <label className="custom-control-label" htmlFor="cbRenameRedirect">
            { t('modal_rename.label.Redirect') }
            <p className="form-text text-muted mt-0">{ t('modal_rename.help.redirect') }</p>
          </label>
        </div>

        <div className="custom-control custom-checkbox custom-checkbox-primary">
          <input
            className="custom-control-input"
            id="cbRenameMetadata"
            type="checkbox"
            checked={isRenameMetadata}
            onChange={() => setIsRenameMetadata(!isRenameRedirect)}
          />
          <label className="custom-control-label" htmlFor="cbRenameMetadata">
            { t('modal_rename.label.Do not update metadata') }
            <p className="form-text text-muted mt-0">{ t('modal_rename.help.metadata') }</p>
          </label>
        </div>
      </ModalBody>
      <ModalFooter>
        <ApiErrorMessageList errs={errs} targetPath={currentPage.path} onLoadLatestRevision={loadLatestRevision} />
        <button
          type="button"
          className="btn btn-primary"
          //  TODO enable rename by GW 5088
          // onClick={rename}
          // disabled={(isRenameRecursively && !isRenameRecursivelyWithoutExistPath && existingPaths.length !== 0)}
        >
          Rename
        </button>
      </ModalFooter>
    </Modal>
  );
};

export default PageRenameModal;
