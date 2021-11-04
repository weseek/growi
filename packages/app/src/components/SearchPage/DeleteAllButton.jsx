import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

const DeleteAllButton = (props) => {
  const { t } = useTranslation();
  const { selectedPages } = props;

  function deleteAllSelectedPage() {
    console.log(selectedPages);
    // TODO: implement this function
    // https://estoc.weseek.co.jp/redmine/issues/77543
    // do something with pagesDelete to delete them.
  }

  return (
    <button
      type="button"
      className="text-danger font-weight-light"
      onClick={deleteAllSelectedPage}
    >
      <i className="icon-trash ml-3"></i>
      {t('search_result.delete_all_selected_page')}
    </button>
  );

};

DeleteAllButton.propTypes = {
  selectedPages: PropTypes.array.isRequired,
};
export default DeleteAllButton;
