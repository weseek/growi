import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

const IncludeSpecificPathButton = (props) => {
  const { pathToInclude, checked } = props;
  const { t } = useTranslation();

  // TODO : implement this function
  // 77526 story https://estoc.weseek.co.jp/redmine/issues/77526
  // 77535 stroy https://estoc.weseek.co.jp/redmine/issues/77535
  function includeSpecificPathInSearchResult(pathToInclude) {
    console.log(`now including ${pathToInclude} in search result`);
  }
  return (
    <div className="border px-2 btn btn-outline-secondary">
      <label className="mb-0">
        <span className="font-weight-light">
          {pathToInclude === '/user'
            ? t('search_result.include_certain_path', { pathToInclude: '/user' }) : t('search_result.include_certain_path', { pathToInclude: '/trash' })}
        </span>
        <input
          type="checkbox"
          name="check-include-specific-path"
          onChange={() => {
            if (checked) {
              includeSpecificPathInSearchResult(pathToInclude);
            }
          }}
        />
      </label>
    </div>
  );

};

IncludeSpecificPathButton.propTypes = {
  pathToInclude: PropTypes.string.isRequired,
  checked: PropTypes.bool.isRequired,
};

export default IncludeSpecificPathButton;
