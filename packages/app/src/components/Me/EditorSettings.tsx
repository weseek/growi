import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';


type Props = {
}

export const JapaneseTextLintRuleSettings: FC<Props> = () => {
  return (
    <></>
  );
};

export const WithoutJapaneseTextLintRulesSettings: FC<Props> = () => {
  return (
    <></>
  );
};


export const EditorSettings: FC<Props> = () => {
  const { t } = useTranslation();
  // TODO: apply i18n

  return (
    <>
      <h4 className="mt-4">Japanese Settings</h4>
      <div className="offset-lg-2  col-lg-9">
        <div className="row">

          <table className="table table-bordered col-lg-8 mb-5">
            <thead>
              <tr>
                <th scope="col">{ t('scope_of_page_disclosure') }</th>
                <th scope="col">{ t('set_point') }</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">{ t('Public') }</th>
                <td>{ t('always_displayed') }</td>
              </tr>
              <tr>
                <th scope="row">{ t('Anyone with the link') }</th>
                <td>{ t('always_hidden') }</td>
              </tr>
              <tr>
                <th scope="row">{ t('Only me') }</th>
                <td>
                  <div className="custom-control custom-switch custom-checkbox-success">
                    <input
                      type="checkbox"
                      className="custom-control-input"
                      id="isShowRestrictedByOwner"
                      // checked={adminGeneralSecurityContainer.state.isShowRestrictedByOwner}
                      // onChange={() => { adminGeneralSecurityContainer.switchIsShowRestrictedByOwner() }}
                    />
                    <label className="custom-control-label" htmlFor="isShowRestrictedByOwner">
                      {t('displayed_or_hidden')}
                    </label>
                  </div>
                </td>
              </tr>
              <tr>
                <th scope="row">{ t('Only inside the group') }</th>
                <td>
                  <div className="custom-control custom-switch custom-checkbox-success">
                    <input
                      type="checkbox"
                      className="custom-control-input"
                      id="isShowRestrictedByGroup"
                      // checked={adminGeneralSecurityContainer.state.isShowRestrictedByGroup}
                      // onChange={() => { adminGeneralSecurityContainer.switchIsShowRestrictedByGroup() }}
                    />
                    <label className="custom-control-label" htmlFor="isShowRestrictedByGroup">
                      {t('displayed_or_hidden')}
                    </label>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

        </div>
      </div>
    </>
  );
};
