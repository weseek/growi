import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';

import AppContainer from '../../../services/AppContainer';
import MarkDownSettingContainer from '../../../services/MarkDownSettingContainer';
import PresentationLineBreakOptions from './PresentationLineBreakOptions';

class PresentationForm extends React.Component {

  render() {
    const { t } = this.props;

    return (
      <fieldset className="form-group row my-2">

        <label className="col-xs-3 control-label text-right">
          { t('markdown_setting.Page break setting') }
        </label>
        <PresentationLineBreakOptions />
        <div className="form-group my-3">
          <div className="col-xs-offset-4 col-xs-5">
            {/* TODO GW-220 create function */}
            <button type="submit" className="btn btn-primary">{ t('Update') }</button>
          </div>
        </div>

      </fieldset>
    );
  }

}

const PresentationFormWrapper = (props) => {
  return createSubscribedElement(PresentationForm, props, [AppContainer, MarkDownSettingContainer]);
};

PresentationForm.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  markDownSettingContainer: PropTypes.instanceOf(MarkDownSettingContainer).isRequired,

};

export default withTranslation()(PresentationFormWrapper);
