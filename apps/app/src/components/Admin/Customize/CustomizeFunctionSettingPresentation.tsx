import React, { useCallback } from 'react';

import { useTranslation } from 'next-i18next';
import { Card, CardBody } from 'reactstrap';

import AdminCustomizeContainer from '~/client/services/AdminCustomizeContainer';
import { toastSuccess, toastError } from '~/client/util/toastr';

import { withUnstatedContainers } from '../../UnstatedUtils';
import AdminUpdateButtonRow from '../Common/AdminUpdateButtonRow';

import CustomizeFunctionOption from './CustomizeFunctionOption';
import PagingSizeUncontrolledDropdown from './PagingSizeUncontrolledDropdown';


type Props = {
  adminCustomizeContainer: AdminCustomizeContainer
}
const CustomizeFunctionSettingPresentation = (props: Props): JSX.Element => {

  const { adminCustomizeContainer } = props;
  const { t } = useTranslation();

  const onClickSubmit = useCallback(async() => {

    try {
      await adminCustomizeContainer.updateCustomizeFunction();
      toastSuccess(t('toaster.update_successed', { target: t('admin:customize_settings.function'), ns: 'commons' }));
    }
    catch (err) {
      toastError(err);
    }
  }, [t, adminCustomizeContainer]);

  return (
    <React.Fragment>
      <div className="form-group row">
        <div className="offset-md-3 col-md-6 text-left">
          <CustomizeFunctionOption
            optionId="isEnabledMarp"
            label={t('admin:customize_settings.function_options.enable_marp')}
            isChecked={adminCustomizeContainer.state.isEnabledMarp || false}
            onChecked={() => { adminCustomizeContainer.switchIsEnabledMarp() }}
          >
            <p className="form-text text-muted">
              {t('admin:customize_settings.function_options.enable_marp_desc')}
              <br></br>
              <a
                href={`${t('admin:customize_settings.function_options.marp_official_site_link')}`}
                target="_blank"
                rel="noopener noreferrer"
              >{`${t('admin:customize_settings.function_options.marp_official_site')}`}
              </a>
              <br></br>
              <a
                href={`${t('admin:customize_settings.function_options.marp_in_gorwi_link')}`}
                target="_blank"
                rel="noopener noreferrer"
              >{`${t('admin:customize_settings.function_options.marp_in_growi')}`}
              </a>
            </p>
          </CustomizeFunctionOption>
        </div>
      </div>

      <AdminUpdateButtonRow onClick={onClickSubmit} disabled={adminCustomizeContainer.state.retrieveError != null} />

    </React.Fragment>
  );
};
const CustomizeFunctionSettingPresentationWrapper = withUnstatedContainers(CustomizeFunctionSettingPresentation, [AdminCustomizeContainer]);

export default CustomizeFunctionSettingPresentationWrapper;
