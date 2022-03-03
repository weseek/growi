import React, {
  useState, useEffect, useCallback, useMemo,
} from 'react';

import {
  Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';

import { useTranslation } from 'react-i18next';

import { debounce } from 'throttle-debounce';
import { usePageRenameModal } from '~/stores/modal';
import { toastError } from '~/client/util/apiNotification';

import { apiv3Get, apiv3Put } from '~/client/util/apiv3-client';

import ApiErrorMessageList from './PageManagement/ApiErrorMessageList';
import ComparePathsTable from './ComparePathsTable';
import DuplicatedPathsTable from './DuplicatedPathsTable';
import { useSiteUrl } from '~/stores/context';
import { isIPageInfoForEntity } from '~/interfaces/page';
import { useSWRxPageInfo } from '~/stores/page';


const PageRenameModal = (): JSX.Element => {
  const { t } = useTranslation();

  const { data: siteUrl } = useSiteUrl();
  const { data: renameModalData, close: closeRenameModal } = usePageRenameModal();

  const isOpened = renameModalData?.isOpened ?? false;
  const page = renameModalData?.page;

  const shouldFetch = page != null && !isIPageInfoForEntity(page.meta);
  const { data: pageInfo } = useSWRxPageInfo(shouldFetch ? page?.data._id : null);

  if (page != null && pageInfo != null) {
    page.meta = pageInfo;
  }

  const [pageNameInput, setPageNameInput] = useState('');

  const [errs, setErrs] = useState(null);

  const [subordinatedPages, setSubordinatedPages] = useState([]);
  const [existingPaths, setExistingPaths] = useState<string>([]);
  const [isRenameRecursively, SetIsRenameRecursively] = useState(true);
  const [isRenameRedirect, SetIsRenameRedirect] = useState(false);
  const [isRemainMetadata, SetIsRemainMetadata] = useState(false);
  const [subordinatedError] = useState(null);
  const [isRenameRecursivelyWithoutExistPath, setIsRenameRecursivelyWithoutExistPath] = useState(true);

  function changeIsRenameRecursivelyHandler() {
    SetIsRenameRecursively(!isRenameRecursively);
  }

  function changeIsRenameRecursivelyWithoutExistPathHandler() {
    setIsRenameRecursivelyWithoutExistPath(!isRenameRecursivelyWithoutExistPath);
  }

  function changeIsRenameRedirectHandler() {
    SetIsRenameRedirect(!isRenameRedirect);
  }

  function changeIsRemainMetadataHandler() {
    SetIsRemainMetadata(!isRemainMetadata);
  }

  const updateSubordinatedList = useCallback(async() => {
    if (page == null) {
      return;
    }

    const { path } = page.data;
    try {
      const res = await apiv3Get('/pages/subordinated-list', { path });
      setSubordinatedPages(res.data.subordinatedPages);
    }
    catch (err) {
      setErrs(err);
      toastError(t('modal_rename.label.Failed to get subordinated pages'));
    }
  }, [page, t]);

  useEffect(() => {
    if (page != null && isOpened) {
      updateSubordinatedList();
      setPageNameInput(page.data.path);
    }
  }, [isOpened, page, updateSubordinatedList]);


  const checkExistPaths = useCallback(async(fromPath, toPath) => {
    if (page == null) {
      return;
    }

    try {
      const res = await apiv3Get('/page/exist-paths', { fromPath, toPath });
      const { existPaths } = res.data;
      setExistingPaths(existPaths);
    }
    catch (err) {
      setErrs(err);
      toastError(t('modal_rename.label.Failed to get exist path'));
    }
  }, [page, t]);

  const checkExistPathsDebounce = useMemo(() => {
    return debounce(1000, checkExistPaths);
  }, [checkExistPaths]);

  useEffect(() => {
    if (page != null && pageNameInput !== page.data.path) {
      checkExistPathsDebounce(page.data.path, pageNameInput);
    }
  }, [pageNameInput, subordinatedPages, checkExistPathsDebounce, page]);

  /**
   * change pageNameInput
   * @param {string} value
   */
  function inputChangeHandler(value) {
    setErrs(null);
    setPageNameInput(value);
  }

  async function rename() {
    if (page == null) {
      return;
    }

    setErrs(null);

    const { _id, path, revision } = page.data;
    try {
      const response = await apiv3Put('/pages/rename', {
        pageId: _id,
        revisionId: revision,
        isRecursively: isRenameRecursively,
        isRenameRedirect,
        isRemainMetadata,
        newPagePath: pageNameInput,
        path,
      });

      const { page } = response.data;
      const url = new URL(page.path, 'https://dummy');
      if (isRenameRedirect) {
        url.searchParams.append('withRedirect', 'true');
      }

      const onRenamed = renameModalData?.opts?.onRenamed;
      if (onRenamed != null) {
        onRenamed(path);
      }
      closeRenameModal();
    }
    catch (err) {
      setErrs(err);
    }
  }

  if (page == null) {
    return <></>;
  }

  const { path } = page.data;
  const isV5Compatible = isIPageInfoForEntity(page.meta) ? page.meta.isV5Compatible : null;
  const isTargetPageDuplicate = existingPaths.includes(pageNameInput);

  return (
    <Modal size="lg" isOpen={isOpened} toggle={closeRenameModal} autoFocus={false}>
      <ModalHeader tag="h4" toggle={closeRenameModal} className="bg-primary text-light">
        { t('modal_rename.label.Move/Rename page') }
      </ModalHeader>
      <ModalBody>
        <div className="form-group">
          <label>{ t('modal_rename.label.Current page name') }</label><br />
          <code>{ path }</code>
        </div>
        <div className="form-group">
          <label htmlFor="newPageName">{ t('modal_rename.label.New page name') }</label><br />
          <div className="input-group">
            <div className="input-group-prepend">
              <span className="input-group-text">{siteUrl}</span>
            </div>
            <form className="flex-fill" onSubmit={(e) => { e.preventDefault(); rename() }}>
              <input
                type="text"
                value={pageNameInput}
                className="form-control"
                onChange={e => inputChangeHandler(e.target.value)}
                required
                autoFocus
              />
            </form>
          </div>
        </div>

        { isTargetPageDuplicate && (
          <p className="text-danger">Error: Target path is duplicated.</p>
        ) }

        { isV5Compatible === false && (
          <>
            <div className="custom-control custom-radio custom-radio-warning">
              <input
                className="custom-control-input"
                name="recursively"
                id="cbRenameRecursively"
                type="radio"
                checked={isRenameRecursively}
                onChange={changeIsRenameRecursivelyHandler}
              />
              <label className="custom-control-label" htmlFor="cbRenameRecursively">
                {/* { t('modal_rename.label.Recursively') } */}
                Rename this page only
                {/* <p className="form-text text-muted mt-0">{ t('modal_rename.help.recursive') }</p> */}
              </label>
            </div>
            <div className="custom-control custom-radio custom-radio-warning">
              <input
                className="custom-control-input"
                name="withoutExistRecursively"
                id="cbRenamewithoutExistRecursively"
                type="radio"
                // checked={isRenameRecursivelyWithoutExistPath}
                // onChange={changeIsRenameRecursivelyWithoutExistPathHandler}
                checked={!isRenameRecursively}
                onChange={changeIsRenameRecursivelyHandler}
              />
              <label className="custom-control-label" htmlFor="cbRenamewithoutExistRecursively">
                {/* { t('modal_rename.label.Rename without exist path') } */}
                Force rename all pages
                <p className="form-text text-muted mt-0">{ t('modal_rename.help.recursive') }</p>
              </label>
              {!isRenameRecursively && existingPaths.length !== 0 && <DuplicatedPathsTable existingPaths={existingPaths} oldPagePath={pageNameInput} />}
            </div>
            {/* {isRenameRecursively && path != null && <ComparePathsTable path={path} subordinatedPages={subordinatedPages} newPagePath={pageNameInput} />} */}
          </>
        ) }

        <p className="mt-2">
          <a data-toggle="collapse" href="#collapseOptions" role="button" aria-expanded="false" aria-controls="collapseOptions">
            <i className="fa fa-fw fa-arrow-right"></i> Other options
          </a>
        </p>
        <div className="collapse" id="collapseOptions">
          <div className="custom-control custom-checkbox custom-checkbox-success">
            <input
              className="custom-control-input"
              name="create_redirect"
              id="cbRenameRedirect"
              type="checkbox"
              checked={isRenameRedirect}
              onChange={changeIsRenameRedirectHandler}
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
              id="cbRemainMetadata"
              type="checkbox"
              checked={isRemainMetadata}
              onChange={changeIsRemainMetadataHandler}
            />
            <label className="custom-control-label" htmlFor="cbRemainMetadata">
              { t('modal_rename.label.Do not update metadata') }
              <p className="form-text text-muted mt-0">{ t('modal_rename.help.metadata') }</p>
            </label>
          </div>
          <div> {subordinatedError} </div>
        </div>

      </ModalBody>
      <ModalFooter>
        <ApiErrorMessageList errs={errs} targetPath={pageNameInput} />
        <button
          type="button"
          className="btn btn-primary"
          onClick={rename}
          disabled={(isRenameRecursively && !isRenameRecursivelyWithoutExistPath && existingPaths.length !== 0)}
        >Rename
        </button>
      </ModalFooter>
    </Modal>
  );
};

export default PageRenameModal;
