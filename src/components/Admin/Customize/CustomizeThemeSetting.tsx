import { FC } from 'react';

import { useTranslation } from '~/i18n';
import { useCustomizeSettingsSWR } from '~/stores/admin';
// import { withUnstatedContainers } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '~/client/js/util/apiNotification';

// import AppContainer from '../../../services/AppContainer';

// import CustomizeThemeOptions from './CustomizeThemeOptions';
// import AdminCustomizeContainer from '../../../services/AdminCustomizeContainer';
import AdminUpdateButtonRow from '~/client/js/components/Admin/Common/AdminUpdateButtonRow';


export const CustomizeThemeSetting:FC = () => {
  const { t } = useTranslation();
  const { error, isValidating } = useCustomizeSettingsSWR();

  const onClickSubmit = async() => {

    try {
      // await adminCustomizeContainer.updateCustomizeTheme();
      toastSuccess(t('toaster.update_successed', { target: t('admin:customize_setting.theme') }));
    }
    catch (err) {
      toastError(err);
    }
  };
  return (
    <div className="row">
      <div className="col-12">
        <h2 className="admin-setting-header">{t('admin:customize_setting.theme')}</h2>
        {process.env.NODE_ENV === 'development' && (
          <div className="alert alert-warning">
            <strong>DEBUG MESSAGE:</strong> development build では、リアルタイムプレビューが無効になります
          </div>
        )}
        {/* <CustomizeThemeOptions /> */}
        <AdminUpdateButtonRow onClick={onClickSubmit} disabled={error != null} />
      </div>
    </div>
  );
};

// class DeprecatedCustomizeThemeSetting extends React.Component {

//   constructor(props) {
//     super(props);

//     this.onClickSubmit = this.onClickSubmit.bind(this);
//   }

//   async onClickSubmit() {
//     const { t, adminCustomizeContainer } = this.props;

//     try {
//       await adminCustomizeContainer.updateCustomizeTheme();
//       toastSuccess(t('toaster.update_successed', { target: t('admin:customize_setting.theme') }));
//     }
//     catch (err) {
//       toastError(err);
//     }
//   }

//   render() {
//     const { t, adminCustomizeContainer } = this.props;

//     return (
//       <React.Fragment>
//         <div className="row">
//           <div className="col-12">
//             <h2 className="admin-setting-header">{t('admin:customize_setting.theme')}</h2>
//             {this.renderDevAlert()}
//             <CustomizeThemeOptions />
//             <AdminUpdateButtonRow onClick={this.onClickSubmit} disabled={adminCustomizeContainer.state.retrieveError != null} />
//           </div>
//         </div>
//       </React.Fragment>
//     );
//   }

// }

// const CustomizeThemeSettingWrapper = withUnstatedContainers(CustomizeThemeSetting, [AppContainer, AdminCustomizeContainer]);

// CustomizeThemeSetting.propTypes = {
//   t: PropTypes.func.isRequired, // i18next
//   appContainer: PropTypes.instanceOf(AppContainer).isRequired,
//   adminCustomizeContainer: PropTypes.instanceOf(AdminCustomizeContainer).isRequired,
// };

// export default withTranslation()(CustomizeThemeSettingWrapper);
