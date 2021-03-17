import { useState, FC } from 'react';
import { useRouter } from 'next/router';

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
import { apiv3Post } from '~/utils/apiv3-client';

type Props = {
  currentPage: IPage;
  isOpen: boolean;
  onClose: () => void;
  onMutateCurrentPage?: () =>void;
}

const PageDuplicateModal:FC<Props> = (props:Props) => {
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

  const [isDuplicateRecursively, setIsDuplicateRecursively] = useState(true);
  const [isDuplicateRecursivelyWithoutExistPath, setIsDuplicateRecursivelyWithoutExistPath] = useState(true);

  const { currentPage } = props;

  if (currentPagePath == null) {
    return null;
  }

  async function duplicate() {
    setErrs([]);

    try {
      const response = await apiv3Post('/pages/duplicate', { pageId: currentPage._id, pageNameInput, isRecursively: isDuplicateRecursively });

      const { page } = response.data;

      const url = new URL(page.path, 'https://dummy');
      url.searchParams.append('duplicated', currentPage.path);

      router.push(`${url.pathname}${url.search}`);
    }
    catch (err) {
      setErrs(err);
    }
  }

  function inputChangeHandler(value) {
    setErrs([]);
    setPageNameInput(value);
  }

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
                  onSubmit={duplicate}
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
             && <ComparePathsTable currentPagePath={currentPagePath} subordinatedList={subordinatedList} newPagePath={pageNameInput} />}
            {isDuplicateRecursively && existingPaths != null && existingPaths.length !== 0 && currentPagePath !== pageNameInput
             && <DuplicatedPathsTable currentPagePath={currentPagePath} existingPaths={existingPaths} oldPagePath={pageNameInput} />}
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <ApiErrorMessageList errs={errs} targetPath={currentPage.path} onLoadLatestRevision={loadLatestRevision} />
        <button
          type="button"
          className="btn btn-primary"
          onClick={duplicate}
          disabled={(isDuplicateRecursively && !isDuplicateRecursivelyWithoutExistPath && existingPaths != null && existingPaths.length !== 0)}
        >
          { t('modal_duplicate.label.Duplicate page') }
        </button>
      </ModalFooter>
    </Modal>
  );
};

export default PageDuplicateModal;
