import {
  useState, useEffect, useCallback, FC,
} from 'react';

import {
  Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';
import { debounce } from 'throttle-debounce';
import { useCurrentPagePath, useSearchServiceReachable } from '~/stores/context';
import { apiv3Get } from '~/client/js/util/apiv3-client';

import { useTranslation } from '~/i18n';

import { toastSuccess, toastError } from '~/client/js/util/apiNotification';

import { useCurrentPageSWR, useSubordinatedList } from '~/stores/page';


import { Page as IPage } from '~/interfaces/page';

import { ApiErrorMessageList } from '~/components/PageManagement/ApiErrorMessageList';

import { PagePathAutoComplete } from '~/components/PagePathAutoComplete';
// import PagePathAutoComplete from '~/client/js/components/PagePathAutoComplete';
import { ComparePathsTable } from '~/components/PageManagement/ComparePathsTable';
// import DuplicatePathsTable from './DuplicatedPathsTable';

const LIMIT_FOR_LIST = 10;

type Props = {
  currentPage: IPage;
  isOpen: boolean;
  onClose: () => void;
  onMutateCurrentPage?: () =>void;
}

const PageDuplicateModal:FC<Props> = (props:Props) => {
  const { t } = useTranslation();
  const { data: currentPagePath } = useCurrentPagePath();
  const { data: isReachable } = useSearchServiceReachable();

  const [existingPaths, setExistingPaths] = useState([]);

  const [pageNameInput, setPageNameInput] = useState(currentPagePath as string);

  const { data: subordinatedList } = useSubordinatedList(currentPagePath as string);
  const [errs, setErrs] = useState([]);

  const [isDuplicateRecursively, setIsDuplicateRecursively] = useState(true);
  const [isDuplicateRecursivelyWithoutExistPath, setIsDuplicateRecursivelyWithoutExistPath] = useState(true);

  const checkExistPaths = async(newParentPath) => {
    try {
      const res = await apiv3Get('/page/exist-paths', { fromPath: currentPagePath, toPath: newParentPath });
      const { existPaths } = res.data;
      setExistingPaths(existPaths);
    }
    catch (err) {
      setErrs(err);
      toastError(t('modal_rename.label.Fail to get exist path'));
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const checkExistPathsDebounce = useCallback(
    debounce(1000, checkExistPaths), [],
  );


  useEffect(() => {
    if (pageNameInput !== currentPagePath) {
      checkExistPathsDebounce(pageNameInput, subordinatedList);
    }
  }, [pageNameInput, subordinatedList, currentPagePath, checkExistPathsDebounce]);

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
              {/* <span className="input-group-text">{crowi.url}</span> */}
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

          <div>
            {isDuplicateRecursively && existingPaths.length !== 0 && (
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
          </div>
          <div>
            {isDuplicateRecursively && subordinatedList != null
             && <ComparePathsTable currentPagePath={currentPagePath as string} subordinatedList={subordinatedList} newPagePath={pageNameInput} />}
            {/* {isDuplicateRecursively && existingPaths.length !== 0 && <DuplicatePathsTable existingPaths={existingPaths} oldPagePath={pageNameInput} />} */}
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


//   const checkExistPaths = async(newParentPath) => {
//     try {
//       const res = await appContainer.apiv3Get('/page/exist-paths', { fromPath: path, toPath: newParentPath });
//       const { existPaths } = res.data;
//       setExistingPaths(existPaths);
//     }
//     catch (err) {
//       setErrs(err);
//       toastError(t('modal_rename.label.Fail to get exist path'));
//     }
//   };

//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   const checkExistPathsDebounce = useCallback(
//     debounce(1000, checkExistPaths), [],
//   );

//   useEffect(() => {
//     if (pageNameInput !== path) {
//       checkExistPathsDebounce(pageNameInput, subordinatedPages);
//     }
//   }, [pageNameInput, subordinatedPages, path, checkExistPathsDebounce]);

//   /**
//    * change pageNameInput for PagePathAutoComplete
//    * @param {string} value
//    */
//   function ppacInputChangeHandler(value) {
//     setErrs(null);
//     setPageNameInput(value);
//   }

//   /**
//    * change pageNameInput
//    * @param {string} value
//    */
//   function inputChangeHandler(value) {
//     setErrs(null);
//     setPageNameInput(value);
//   }

//   function changeIsDuplicateRecursivelyHandler() {
//     setIsDuplicateRecursively(!isDuplicateRecursively);
//   }

//   const getSubordinatedList = useCallback(async() => {
//     try {
//       const res = await appContainer.apiv3Get('/pages/subordinated-list', { path, limit: LIMIT_FOR_LIST });
//       const { subordinatedPaths } = res.data;
//       setSubordinatedPages(subordinatedPaths);
//     }
//     catch (err) {
//       setErrs(err);
//       toastError(t('modal_duplicate.label.Fail to get subordinated pages'));
//     }
//   }, [appContainer, path, t]);

//   useEffect(() => {
//     if (props.isOpen) {
//       getSubordinatedList();
//     }
//   }, [props.isOpen, getSubordinatedList]);

//   function changeIsDuplicateRecursivelyWithoutExistPathHandler() {
//     setIsDuplicateRecursivelyWithoutExistPath(!isDuplicateRecursivelyWithoutExistPath);
//   }

//   async function duplicate() {
//     setErrs(null);

//     try {
//       await appContainer.apiv3Post('/pages/duplicate', { pageId, pageNameInput, isRecursively: isDuplicateRecursively });
//       window.location.href = encodeURI(`${pageNameInput}?duplicated=${path}`);
//     }
//     catch (err) {
//       setErrs(err);
//     }
//   }

//   function ppacSubmitHandler() {
//     duplicate();
//   }

//   return (
//     <Modal size="lg" isOpen={props.isOpen} toggle={props.onClose} className="grw-duplicate-page" autoFocus={false}>
//       <ModalHeader tag="h4" toggle={props.onClose} className="bg-primary text-light">
//         { t('modal_duplicate.label.Duplicate page') }
//       </ModalHeader>
//       <ModalBody>
//         <div className="form-group"><label>{t('modal_duplicate.label.Current page name')}</label><br />
//           <code>{path}</code>
//         </div>
//         <div className="form-group">
//           <label htmlFor="duplicatePageName">{ t('modal_duplicate.label.New page name') }</label><br />
//           <div className="input-group">
//             <div className="input-group-prepend">
//               <span className="input-group-text">{crowi.url}</span>
//             </div>
//             <div className="flex-fill">
//               {isReachable
//               ? (
//                 <PagePathAutoComplete
//                   initializedPath={path}
//                   onSubmit={ppacSubmitHandler}
//                   onInputChange={ppacInputChangeHandler}
//                   autoFocus
//                 />
//               )
//               : (
//                 <input
//                   type="text"
//                   value={pageNameInput}
//                   className="form-control"
//                   onChange={e => inputChangeHandler(e.target.value)}
//                   required
//                 />
//               )}
//             </div>
//           </div>
//         </div>
//         <div className="custom-control custom-checkbox custom-checkbox-warning mb-3">
//           <input
//             className="custom-control-input"
//             name="recursively"
//             id="cbDuplicateRecursively"
//             type="checkbox"
//             checked={isDuplicateRecursively}
//             onChange={changeIsDuplicateRecursivelyHandler}
//           />
//           <label className="custom-control-label" htmlFor="cbDuplicateRecursively">
//             { t('modal_duplicate.label.Recursively') }
//             <p className="form-text text-muted mt-0">{ t('modal_duplicate.help.recursive') }</p>
//           </label>

//           <div>
//             {isDuplicateRecursively && existingPaths.length !== 0 && (
//             <div className="custom-control custom-checkbox custom-checkbox-warning">
//               <input
//                 className="custom-control-input"
//                 name="withoutExistRecursively"
//                 id="cbDuplicatewithoutExistRecursively"
//                 type="checkbox"
//                 checked={isDuplicateRecursivelyWithoutExistPath}
//                 onChange={changeIsDuplicateRecursivelyWithoutExistPathHandler}
//               />
//               <label className="custom-control-label" htmlFor="cbDuplicatewithoutExistRecursively">
//                 { t('modal_duplicate.label.Duplicate without exist path') }
//               </label>
//             </div>
//             )}
//           </div>
//           <div>
//             {isDuplicateRecursively && <ComparePathsTable subordinatedPages={subordinatedPages} newPagePath={pageNameInput} />}
//             {isDuplicateRecursively && existingPaths.length !== 0 && <DuplicatePathsTable existingPaths={existingPaths} oldPagePath={pageNameInput} />}
//           </div>
//         </div>

//       </ModalBody>
//       <ModalFooter>
//         <ApiErrorMessageList errs={errs} targetPath={pageNameInput} />
//         <button
//           type="button"
//           className="btn btn-primary"
//           onClick={duplicate}
//           disabled={(isDuplicateRecursively && !isDuplicateRecursivelyWithoutExistPath && existingPaths.length !== 0)}
//         >
//           { t('modal_duplicate.label.Duplicate page') }
//         </button>
//       </ModalFooter>
//     </Modal>
//   );
// };
