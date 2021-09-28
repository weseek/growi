import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

const DeleteAllButton = (props) => {
  const { selectedPage, checked } = props;
  const { t } = useTranslation();
  function deleteAllSelectedPage(pagesToDelete) {
    // TODO: implement this function
    // https://estoc.weseek.co.jp/redmine/issues/77543
    // do something with pagesDelete to delete them.
  }
  return (
    <div>
      <label>
        <input
          type="checkbox"
          name="check-delte-all"
          onChange={() => {
            if (checked) {
              deleteAllSelectedPage(selectedPage);
            }
          }}
        />
        <span className="text-danger font-weight-light">
          <i className="icon-trash ml-3"></i>
          {t('search_result.delete_all_selected_page')}
        </span>
      </label>
    </div>
  );

};

DeleteAllButton.propTypes = {
  selectedPage: PropTypes.array.isRequired,
  checked: PropTypes.bool.isRequired,
};
export default DeleteAllButton;
