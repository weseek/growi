import { useState, FC } from 'react';
import { useRouter } from 'next/router';
import {
  Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';

import { toastSuccess } from '~/client/js/util/apiNotification';
import { useTranslation } from '~/i18n';

import { useCurrentPageSWR, useExistingPaths, useSubordinatedList } from '~/stores/page';

import { Page as IPage } from '~/interfaces/page';

import { ApiErrorMessageList } from '~/components/PageManagement/ApiErrorMessageList';
import { PagePathAutoComplete } from '~/components/PagePathAutoComplete';
import { useCurrentPagePath, useSearchServiceReachable, useSiteUrl } from '~/stores/context';

import { ComparePathsTable } from '~/components/PageManagement/ComparePathsTable';
import { DuplicatedPathsTable } from '~/components/PageManagement/DuplicatedPathsTable';
import { apiv3Put } from '~/utils/apiv3-client';

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
  const router = useRouter();
  const { t } = useTranslation();
  const { mutate: mutateCurrentPage } = useCurrentPageSWR();

  const { data: siteUrl } = useSiteUrl();
  const { data: currentPagePath } = useCurrentPagePath();
  const { data: isReachable } = useSearchServiceReachable();

  const [pageNameInput, setPageNameInput] = useState(currentPagePath as string);

  const { data: subordinatedList } = useSubordinatedList(currentPagePath as string);
  const { data: existingPaths } = useExistingPaths(currentPagePath as string, pageNameInput);

  const [errs, setErrs] = useState([]);

  const [isRenameRecursively, setIsRenameRecursively] = useState(true);
  const [isRenameRedirect, setIsRenameRedirect] = useState(false);
  const [isRemainMetadata, setIsRemainMetadata] = useState(false);
  const [isRenameRecursivelyWithoutExistPath, setIsRenameRecursivelyWithoutExistPath] = useState(true);

  const { currentPage } = props;

  if (currentPagePath == null) {
    return null;
  }

  async function rename() {
    setErrs([]);

    try {
      const response = await apiv3Put('/pages/rename', {
        revisionId: currentPage.revision._id,
        pageId: currentPage._id,
        isRecursively: isRenameRecursively,
        isRenameRedirect,
        isRemainMetadata,
        newPagePath: pageNameInput,
        path: currentPage.path,
        // socketClientId: socketIoContainer.getSocketClientId(),
      });

      const { page } = response.data;

      const url = new URL(page.path, 'https://dummy');
      url.searchParams.append('renamedFrom', currentPage.path);
      if (isRenameRedirect) {
        url.searchParams.append('withRedirect', 'true');
      }

      router.push(`${url.pathname}${url.search}`);
    }
    catch (err) {
      setErrs(err);
    }
  }


  function changeIsRenameRecursivelyWithoutExistPathHandler() {
    setIsRenameRecursivelyWithoutExistPath(!isRenameRecursivelyWithoutExistPath);
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
                  onSubmit={rename}
                  onInputChange={inputChangeHandler}
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

          {existingPaths != null && existingPaths.length !== 0 && (
            <div
              className="custom-control custom-checkbox custom-checkbox-warning"
            >
              <input
                className="custom-control-input"
                id="cbRenamewithoutExistRecursively"
                type="checkbox"
                checked={isRenameRecursivelyWithoutExistPath}
                onChange={changeIsRenameRecursivelyWithoutExistPathHandler}
              />
              <label className="custom-control-label" htmlFor="cbRenamewithoutExistRecursively">
                { t('modal_rename.label.Rename without exist path') }
              </label>
            </div>
          )}
          {isRenameRecursively && subordinatedList != null
           && <ComparePathsTable currentPagePath={currentPagePath} subordinatedList={subordinatedList} newPagePath={pageNameInput} />}
          {isRenameRecursively && existingPaths != null && existingPaths.length !== 0 && currentPagePath !== pageNameInput
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
            checked={isRemainMetadata}
            onChange={() => setIsRemainMetadata(!isRemainMetadata)}
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
          onClick={rename}
          disabled={(isRenameRecursively && !isRenameRecursivelyWithoutExistPath && existingPaths != null && existingPaths.length !== 0)}
        >
          Rename
        </button>
      </ModalFooter>
    </Modal>
  );
};

export default PageRenameModal;
