import { useState, FC } from 'react';

import {
  Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';

import { useCurrentPagePath, useSearchServiceReachable, useSiteUrl } from '~/stores/context';
import { useCurrentPageSWR, useExistingPaths, useSubordinatedList } from '~/stores/page';

import { toastSuccess } from '~/client/js/util/apiNotification';
import { useTranslation } from '~/i18n';


import { Page as IPage } from '~/interfaces/page';

import { ApiErrorMessageList } from '~/components/PageManagement/ApiErrorMessageList';

import { PagePathAutoComplete } from '~/components/PagePathAutoComplete';
import { ComparePathsTable } from '~/components/PageManagement/ComparePathsTable';
import { DuplicatedPathsTable } from '~/components/PageManagement/DuplicatedPathsTable';

const LIMIT_FOR_LIST = 10;

type Props = {
  currentPage: IPage;
  isOpen: boolean;
  onClose: () => void;
  onMutateCurrentPage?: () =>void;
}

const PageDuplicateModal:FC<Props> = (props:Props) => {
  const { t } = useTranslation();

  const { data: siteUrl } = useSiteUrl();
  const { data: currentPagePath } = useCurrentPagePath();
  const { data: isReachable } = useSearchServiceReachable();

  const [pageNameInput, setPageNameInput] = useState(currentPagePath as string);

  const { data: subordinatedList } = useSubordinatedList(currentPagePath as string);
  const { data: existingPaths } = useExistingPaths(currentPagePath as string, pageNameInput);

  const [errs, setErrs] = useState([]);

  const [isDuplicateRecursively, setIsDuplicateRecursively] = useState(true);
  const [isDuplicateRecursivelyWithoutExistPath, setIsDuplicateRecursivelyWithoutExistPath] = useState(true);

  function inputChangeHandler(value) {
    setErrs([]);
    setPageNameInput(value);
  }

  function ppacInputChangeHandler(value) {
    setErrs([]);
    setPageNameInput(value);
  }

  async function duplicate() {
    setErrs([]);

    try {
      // TODO: enable isDuplicateRecursively by GW-5117
      // await apiv3Post('/pages/duplicate', { pageId, pageNameInput, isRecursively: isDuplicateRecursively });
      // window.location.href = encodeURI(`${pageNameInput}?duplicated=${path}`);
    }
    catch (err) {
      setErrs(err);
    }
  }

  function ppacSubmitHandler() {
    duplicate();
  }

  const { mutate: mutateCurrentPage } = useCurrentPageSWR();

  const { currentPage } = props;

  const loadLatestRevision = () => {
    props.onClose();
    mutateCurrentPage();
    toastSuccess(t('retrieve_again'));
  };

  return (
    <Modal size="lg" isOpen={props.isOpen} toggle={props.onClose} autoFocus={false}>
      <ModalHeader tag="h4" toggle={props.onClose} className="bg-primary text-light">
        { t('modal_duplicate.label.Duplicate page') }
      </ModalHeader>
      <ModalBody>
        <div className="form-group"><label>{t('modal_duplicate.label.Current page name')}</label><br />
          <code>{currentPage.path}</code>
        </div>
        <div className="form-group">
          <label htmlFor="duplicatePageName">{ t('modal_duplicate.label.New page name') }</label><br />
          <div className="input-group">
            <div className="input-group-prepend">
              <span className="input-group-text">{siteUrl}</span>
            </div>
            <div className="flex-fill">
              {isReachable
              ? (
                <PagePathAutoComplete
                  initializedPath={currentPagePath}
                  onSubmit={ppacSubmitHandler}
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
        <div className="custom-control custom-checkbox custom-checkbox-warning mb-3">
          <input
            className="custom-control-input"
            name="recursively"
            id="cbDuplicateRecursively"
            type="checkbox"
            checked={isDuplicateRecursively}
            onChange={() => setIsDuplicateRecursively(!isDuplicateRecursively)}
          />
          <label className="custom-control-label" htmlFor="cbDuplicateRecursively">
            { t('modal_duplicate.label.Recursively') }
            <p className="form-text text-muted mt-0">{ t('modal_duplicate.help.recursive') }</p>
          </label>

          {isDuplicateRecursively && existingPaths != null && existingPaths.length !== 0 && (
          <div className="custom-control custom-checkbox custom-checkbox-warning">
            <input
              className="custom-control-input"
              name="withoutExistRecursively"
              id="cbDuplicatewithoutExistRecursively"
              type="checkbox"
              checked={isDuplicateRecursivelyWithoutExistPath}
              onChange={() => setIsDuplicateRecursivelyWithoutExistPath(!isDuplicateRecursivelyWithoutExistPath)}
            />
            <label className="custom-control-label" htmlFor="cbDuplicatewithoutExistRecursively">
              { t('modal_duplicate.label.Duplicate without exist path') }
            </label>
          </div>
            )}
          <div>
            {isDuplicateRecursively && subordinatedList != null
             && <ComparePathsTable currentPagePath={currentPagePath as string} subordinatedList={subordinatedList} newPagePath={pageNameInput} />}
            {isDuplicateRecursively && existingPaths != null && existingPaths.length !== 0
             && <DuplicatedPathsTable currentPagePath={currentPagePath as string} existingPaths={existingPaths} oldPagePath={pageNameInput} />}
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <ApiErrorMessageList errs={errs} targetPath={currentPage.path} onLoadLatestRevision={loadLatestRevision} />
        <button
          type="button"
          className="btn btn-primary"
          // onClick={duplicate}
          // disabled={(isDuplicateRecursively && !isDuplicateRecursivelyWithoutExistPath && existingPaths.length !== 0)}
        >
          { t('modal_duplicate.label.Duplicate page') }
        </button>
      </ModalFooter>
    </Modal>
  );
};

export default PageDuplicateModal;
