import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

const IncludeSpecificPathButton = (props) => {
  const { pathToInclude } = props;
  const { t } = useTranslation();
  const [checked, setChecked] = useState(true);

  // TODO : implement this function
  // 77526 story https://estoc.weseek.co.jp/redmine/issues/77526
  // 77535 stroy https://estoc.weseek.co.jp/redmine/issues/77535
  function includeSpecificPathInSearchResult(pathToInclude) {
    console.log(`now including ${pathToInclude} in search result`);
  }
  return (
    <div className="border px-2 btn btn-outline-secondary">
      <label className="mb-0">
        <span className="font-weight-light">{pathToInclude === '/user' ? t('search_result.include_user_path') : t('search_result.include_trash_path')}</span>
        <input
          type="checkbox"
          name="check"
          onChange={() => {
            setChecked(prevState => !prevState);
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
};

export default IncludeSpecificPathButton;
