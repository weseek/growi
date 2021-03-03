import { useState, FC } from 'react';
import { useForm } from 'react-hook-form';
import { pathUtils } from 'growi-commons';
import {
  Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';
import SearchTypeahead from '~/client/js/components/SearchTypeahead';

import { toastSuccess } from '~/client/js/util/apiNotification';
import { useTranslation } from '~/i18n';

import { useCurrentPageSWR } from '~/stores/page';

import { Page as IPage } from '~/interfaces/page';

import { ApiErrorMessageList } from '~/components/PageManagement/ApiErrorMessageList';


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
              {/* <span className="input-group-text">{crowi.url} </span> */}
            </div>
            {/* TODO imprv submitHandler by GW 5088 */}
            {/* <form className="flex-fill" onSubmit={(e) => { e.preventDefault(); rename() }}> */}
            {/* <form className="flex-fill" onSubmit={handleSubmit(submitHandler)}> */}
            <SearchTypeahead
              onSubmit={submitHandler}
              onSearchError={setSearchError}
              onChange={inputChangeHandler}
              onInputChange={props.onInputChange}
              inputName="new_path"
              placeholder="Input page path"
              keywordOnInit={props.keyword}
              name="pagename"
              required
              autoFocus
            />
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

// const DeprecatedPageRenameModal = (props) => {
//   const {
//     t, appContainer, pageContainer,
//   } = props;

//   const { path } = pageContainer.state;

//   const { crowi } = appContainer.config;

//   const [pageNameInput, setPageNameInput] = useState(path);

//   const [errs, setErrs] = useState(null);

//   const [subordinatedPages, setSubordinatedPages] = useState([]);
//   const [existingPaths, setExistingPaths] = useState([]);
//   const [isRenameRecursively, SetIsRenameRecursively] = useState(true);
//   const [isRenameRedirect, SetIsRenameRedirect] = useState(false);
//   const [isRenameMetadata, SetIsRenameMetadata] = useState(false);
//   const [subordinatedError] = useState(null);
//   const [isRenameRecursivelyWithoutExistPath, setIsRenameRecursivelyWithoutExistPath] = useState(true);

//   function changeIsRenameRecursivelyHandler() {
//     SetIsRenameRecursively(!isRenameRecursively);
//   }

//   function changeIsRenameRecursivelyWithoutExistPathHandler() {
//     setIsRenameRecursivelyWithoutExistPath(!isRenameRecursivelyWithoutExistPath);
//   }

//   function changeIsRenameRedirectHandler() {
//     SetIsRenameRedirect(!isRenameRedirect);
//   }

//   function changeIsRenameMetadataHandler() {
//     SetIsRenameMetadata(!isRenameMetadata);
//   }

//   const updateSubordinatedList = useCallback(async() => {
//     try {
//       const res = await appContainer.apiv3Get('/pages/subordinated-list', { path });
//       const { subordinatedPaths } = res.data;
//       setSubordinatedPages(subordinatedPaths);
//     }
//     catch (err) {
//       setErrs(err);
//       toastError(t('modal_rename.label.Fail to get subordinated pages'));
//     }
//   }, [appContainer, path, t]);

//   useEffect(() => {
//     if (props.isOpen) {
//       updateSubordinatedList();
//     }
//   }, [props.isOpen, updateSubordinatedList]);


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
//    * change pageNameInput
//    * @param {string} value
//    */
//   function inputChangeHandler(value) {
//     setErrs(null);
//     setPageNameInput(value);
//   }

//   async function rename() {
//     setErrs(null);

//     try {
//       const response = await pageContainer.rename(
//         pageNameInput,
//         isRenameRecursively,
//         isRenameRedirect,
//         isRenameMetadata,
//       );

//       const { page } = response.data;
//       const url = new URL(page.path, 'https://dummy');
//       url.searchParams.append('renamedFrom', path);
//       if (isRenameRedirect) {
//         url.searchParams.append('withRedirect', true);
//       }

//       window.location.href = `${url.pathname}${url.search}`;
//     }
//     catch (err) {
//       setErrs(err);
//     }
//   }

//   return (
//     <Modal size="lg" isOpen={props.isOpen} toggle={props.onClose} autoFocus={false}>
//       <ModalHeader tag="h4" toggle={props.onClose} className="bg-primary text-light">
//         { t('modal_rename.label.Move/Rename page') }
//       </ModalHeader>
//       <ModalBody>
//         <div className="form-group">
//           <label>{ t('modal_rename.label.Current page name') }</label><br />
//           <code>{ path }</code>
//         </div>
//         <div className="form-group">
//           <label htmlFor="newPageName">{ t('modal_rename.label.New page name') }</label><br />
//           <div className="input-group">
//             <div className="input-group-prepend">
//               <span className="input-group-text">{crowi.url}</span>
//             </div>
//             <form className="flex-fill" onSubmit={(e) => { e.preventDefault(); rename() }}>
//               <input
//                 type="text"
//                 value={pageNameInput}
//                 className="form-control"
//                 onChange={e => inputChangeHandler(e.target.value)}
//                 required
//                 autoFocus
//               />
//             </form>
//           </div>
//         </div>
//         <div className="custom-control custom-checkbox custom-checkbox-warning">
//           <input
//             className="custom-control-input"
//             name="recursively"
//             id="cbRenameRecursively"
//             type="checkbox"
//             checked={isRenameRecursively}
//             onChange={changeIsRenameRecursivelyHandler}
//           />
//           <label className="custom-control-label" htmlFor="cbRenameRecursively">
//             { t('modal_rename.label.Recursively') }
//             <p className="form-text text-muted mt-0">{ t('modal_rename.help.recursive') }</p>
//           </label>
//           {existingPaths.length !== 0 && (
//           <div
//             className="custom-control custom-checkbox custom-checkbox-warning"
//             style={{ display: isRenameRecursively ? '' : 'none' }}
//           >
//             <input
//               className="custom-control-input"
//               name="withoutExistRecursively"
//               id="cbRenamewithoutExistRecursively"
//               type="checkbox"
//               checked={isRenameRecursivelyWithoutExistPath}
//               onChange={changeIsRenameRecursivelyWithoutExistPathHandler}
//             />
//             <label className="custom-control-label" htmlFor="cbRenamewithoutExistRecursively">
//               { t('modal_rename.label.Rename without exist path') }
//             </label>
//           </div>
//           )}
//           {isRenameRecursively && <ComparePathsTable subordinatedPages={subordinatedPages} newPagePath={pageNameInput} />}
//           {isRenameRecursively && existingPaths.length !== 0 && <DuplicatedPathsTable existingPaths={existingPaths} oldPagePath={pageNameInput} />}
//         </div>

//         <div className="custom-control custom-checkbox custom-checkbox-success">
//           <input
//             className="custom-control-input"
//             name="create_redirect"
//             id="cbRenameRedirect"
//             type="checkbox"
//             checked={isRenameRedirect}
//             onChange={changeIsRenameRedirectHandler}
//           />
//           <label className="custom-control-label" htmlFor="cbRenameRedirect">
//             { t('modal_rename.label.Redirect') }
//             <p className="form-text text-muted mt-0">{ t('modal_rename.help.redirect') }</p>
//           </label>
//         </div>

//         <div className="custom-control custom-checkbox custom-checkbox-primary">
//           <input
//             className="custom-control-input"
//             name="remain_metadata"
//             id="cbRenameMetadata"
//             type="checkbox"
//             checked={isRenameMetadata}
//             onChange={changeIsRenameMetadataHandler}
//           />
//           <label className="custom-control-label" htmlFor="cbRenameMetadata">
//             { t('modal_rename.label.Do not update metadata') }
//             <p className="form-text text-muted mt-0">{ t('modal_rename.help.metadata') }</p>
//           </label>
//         </div>
//         <div> {subordinatedError} </div>
//       </ModalBody>
//       <ModalFooter>
//         <ApiErrorMessageList errs={errs} targetPath={pageNameInput} />
//         <button
//           type="button"
//           className="btn btn-primary"
//           onClick={rename}
//           disabled={(isRenameRecursively && !isRenameRecursivelyWithoutExistPath && existingPaths.length !== 0)}
//         >Rename
//         </button>
//       </ModalFooter>
//     </Modal>
//   );
// };

/**
 * Wrapper component for using unstated
 */
// const PageRenameModalWrapper = withUnstatedContainers(PageRenameModal, [AppContainer, PageContainer]);


// PageRenameModal.propTypes = {
//   appContainer: PropTypes.instanceOf(AppContainer).isRequired,
//   pageContainer: PropTypes.instanceOf(PageContainer).isRequired,

//   isOpen: PropTypes.bool.isRequired,
//   onClose: PropTypes.func.isRequired,

//   path: PropTypes.string.isRequired,
// };

// export default (PageRenameModalWrapper);
