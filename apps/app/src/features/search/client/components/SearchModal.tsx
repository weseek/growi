import React from 'react';

import { useTranslation } from 'next-i18next';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from 'reactstrap';


import { useSearchModal } from '../stores/search';

const SearchHelpCollapse = (): JSX.Element => {
  const { t } = useTranslation();
  return (
    <>
      <p>
        <a data-bs-toggle="collapse" href="#collapseExample" role="button" aria-expanded="false" aria-controls="collapseExample">
          {/* Searching help <span className="material-symbols-outlined">expand_more</span> */}
          <h5 className="h6"><i className="icon-magnifier pe-2 mb-2" />{ t('search_help.title') }</h5>
        </a>
      </p>
      <div className="collapse" id="collapseExample">
        <table className="table grw-search-table search-help m-0">
          <tbody>
            <tr>
              <th className="py-2">
                <code>word1</code> <code>word2</code><br></br>
                <small>({ t('search_help.and.syntax help') })</small>
              </th>
              <td><h6 className="m-0">{ t('search_help.and.desc', { word1: 'word1', word2: 'word2' }) }</h6></td>
            </tr>
            <tr>
              <th className="py-2">
                <code>&quot;This is GROWI&quot;</code><br></br>
                <small>({ t('search_help.phrase.syntax help') })</small>
              </th>
              <td><h6 className="m-0">{ t('search_help.phrase.desc', { phrase: 'This is GROWI' }) }</h6></td>
            </tr>
            <tr>
              <th className="py-2"><code>-keyword</code></th>
              <td><h6 className="m-0">{ t('search_help.exclude.desc', { word: 'keyword' }) }</h6></td>
            </tr>
            <tr>
              <th className="py-2"><code>prefix:/user/</code></th>
              <td><h6 className="m-0">{ t('search_help.prefix.desc', { path: '/user/' }) }</h6></td>
            </tr>
            <tr>
              <th className="py-2"><code>-prefix:/user/</code></th>
              <td><h6 className="m-0">{ t('search_help.exclude_prefix.desc', { path: '/user/' }) }</h6></td>
            </tr>
            <tr>
              <th className="py-2"><code>tag:wiki</code></th>
              <td><h6 className="m-0">{ t('search_help.tag.desc', { tag: 'wiki' }) }</h6></td>
            </tr>
            <tr>
              <th className="py-2"><code>-tag:wiki</code></th>
              <td><h6 className="m-0">{ t('search_help.exclude_tag.desc', { tag: 'wiki' }) }</h6></td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
};

const SearchModal = (): JSX.Element => {
  const { t } = useTranslation();
  const { data: searchModalData, close: closeSearchModal } = useSearchModal();

  return (
    <Modal isOpen={searchModalData?.isOpened ?? false} toggle={closeSearchModal}>
      <ModalHeader>
        header
      </ModalHeader>

      <ModalBody>
        <SearchHelpCollapse />
      </ModalBody>

      <ModalFooter>
        footer
      </ModalFooter>
    </Modal>
  );
};

export default SearchModal;
