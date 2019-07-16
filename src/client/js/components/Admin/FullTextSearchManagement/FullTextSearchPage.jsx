import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import AdminRebuildSearch from '../AdminRebuildSearch';
import AppContainer from '../../../services/AppContainer';

import { createSubscribedElement } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';


class FullTextSearchManagement extends React.Component {

  constructor(props) {
    super(props);

    this.buildIndex = this.buildIndex.bind(this);
  }

  async buildIndex() {

    const { appContainer } = this.props;
    const pageId = this.pageId;

    try {
      const res = await appContainer.apiPost('/admin/search/build', { page_id: pageId });
      if (!res.ok) {
        throw new Error(res.message);
      }
      else {
        toastSuccess('Building request is successfully posted.');
      }
    }
    catch (e) {
      toastError(e, (new Error('エラーが発生しました')));
    }
  }

  render() {
    const { t } = this.props;

    return (
      <Fragment>
        <fieldset className="pr-3">
          <legend> { t('full_text_search_management.elasticsearch_management') } </legend>
          <div className="form-group form-horizontal">
            <div className="col-xs-3 control-label"></div>
            <div className="col-xs-7">
              <button type="submit" className="btn btn-inverse" onClick={this.buildIndex}>{ t('full_text_search_management.build_button') }</button>
              <p className="help-block">
                { t('full_text_search_management.rebuild_description_1') }<br />
                { t('full_text_search_management.rebuild_description_2') }<br />
                { t('full_text_search_management.rebuild_description_3') }<br />
              </p>
            </div>
          </div>
        </fieldset>

        <AdminRebuildSearch />
      </Fragment>
    );
  }

}

const FullTextSearchManagementWrapper = (props) => {
  return createSubscribedElement(FullTextSearchManagement, props, [AppContainer]);
};

FullTextSearchManagement.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
};

export default withTranslation()(FullTextSearchManagementWrapper);
