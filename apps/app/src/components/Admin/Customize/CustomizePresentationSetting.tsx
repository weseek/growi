import React, { useCallback } from 'react';

import { StatsEvent } from '@aws-sdk/client-s3';
import { Presentation } from '@growi/presentation';
import { t } from 'i18next';
import { useTranslation } from 'next-i18next';

import AdminCustomizeContainer from '~/client/services/AdminCustomizeContainer';
import { toastSuccess, toastError } from '~/client/util/toastr';

import AdminUpdateButtonRow from '../Common/AdminUpdateButtonRow';

type Props = {
  adminCustomizeContainer: AdminCustomizeContainer
}

export const CustomizePresentationSetting = (props: Props): JSX.Element => {
  const { adminCustomizeContainer } = props;
  return (
    <React.Fragment>
      <h2 className="admin-setting-header">{t('presentation')}</h2>
      <div className="form-group row">
          { optionId = 'isEnabledMarp' }
            label={t('admin:customize_settings.presentation_options.enable_marp')}
            isChecked={adminCustomizeContainer.state.isEnabledMarp || false}
            onChecked={() => { adminCustomizeContainer.switchIsEnabledMarp() }}
          <p className="form-text text-muted">
            {t('admin:customize_settings.presentation_options.enable_marp_desc')}
            <br></br>
            <a
              href={`${t('admin:customize_settings.presentation_options.marp_official_site_link')}`}
              target="_blank"
              rel="noopener noreferrer"
            >{`${t('admin:customize_settings.presentation_options.marp_official_site')}`}
            </a>
            <br></br>
            <a
              href={`${t('admin:customize_settings.presentation_options.marp_in_gorwi_link')}`}
              target="_blank"
              rel="noopener noreferrer"
            >{`${t('admin:customize_settings.presentation_options.marp_in_growi')}`}
            </a>
          </p>

        </div>
      </div>
    // <adminUpdateButtonRow onClick={onClickSubmit} disabled={adminCustomizeContainer.state.retrieveError != null} />
    </React.Fragment>
  );
};
