import React, { useState } from 'react';

import { useTranslation } from 'next-i18next';
import { Collapse } from 'reactstrap';

export const SearchHelp = (): JSX.Element => {
  const { t } = useTranslation();

  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <p>
        <button type="button" className="btn" onClick={() => setIsOpen(!isOpen)}>
          <div className="">
            <span className="material-symbols-outlined">help</span>
            { t('search_help.title') }
            <span className="material-symbols-outlined">{isOpen ? 'expand_less' : 'expand_more'}</span>
          </div>
        </button>
      </p>
      <Collapse isOpen={isOpen}>
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
      </Collapse>
    </>
  );
};
