/* eslint-disable max-len */
import { FC } from 'react';
import { Card, CardBody } from 'reactstrap';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useTranslation } from '~/i18n';

import { toastSuccess, toastError } from '~/client/js/util/apiNotification';
import { useCustomizeSettingsSWR } from '~/stores/admin';
import { apiv3Put } from '~/utils/apiv3-client';


const currentCustomizeTitle = 'customizeTitle';

type FormValues ={
  [currentCustomizeTitle]: string,
}

export const CustomizeTitle:FC = () => {
  const { t } = useTranslation();
  const { data } = useCustomizeSettingsSWR();
  const {
    register, handleSubmit,
  } = useForm({
    defaultValues: {
      [currentCustomizeTitle]: data?.[currentCustomizeTitle],
    },
  });

  const submitHandler: SubmitHandler<FormValues> = async(formValues) => {

    try {
      await apiv3Put('/customize-setting/customize-title', {
        [currentCustomizeTitle]: formValues[currentCustomizeTitle],
      });

      toastSuccess(t('toaster.update_successed', { target: t('admin:customize_setting.custom_title') }));
    }
    catch (err) {
      toastError(err);
    }
  };

  return (
    <div className="row">
      <form role="form" className="col-md-12" onSubmit={handleSubmit(submitHandler)}>
        <div className="col-12">
          <h2 className="admin-setting-header">{t('admin:customize_setting.custom_title')}</h2>
        </div>

        <div className="col-12">
          <Card className="card well">
            <CardBody className="px-0 py-2">
              {/* eslint-disable react/no-danger */}
              <p dangerouslySetInnerHTML={{ __html: t('admin:customize_setting.custom_title_detail') }} />
              <ul>
                <li>
                  <span dangerouslySetInnerHTML={{ __html: t('admin:customize_setting.custom_title_detail_placeholder1') }} />
                </li>
                <li>
                  <span dangerouslySetInnerHTML={{ __html: t('admin:customize_setting.custom_title_detail_placeholder2') }} />
                </li>
                <li>
                  <span dangerouslySetInnerHTML={{ __html: t('admin:customize_setting.custom_title_detail_placeholder3') }} />
                </li>
              </ul>
              {/* eslint-enable react/no-danger */}
            </CardBody>
          </Card>
        </div>

        {/* TODO i18n */}
        <div className="form-text text-muted col-12">
          Default Value: <code>&#123;&#123;pagename&#125;&#125; - &#123;&#123;sitename&#125;&#125;</code>
          <br />
          Default Output Example: <code className="xml">&lt;title&gt;Page name - My GROWI&lt;&#047;title&gt;</code>
        </div>
        <div className="form-group col-12">
          <input
            name={currentCustomizeTitle}
            className="form-control"
            id="customizeTitle"
            ref={register}
          />
        </div>
        <div className="row my-3">
          <div className="mx-auto">
            <button type="submit" className="btn btn-primary">{ t('Update') }</button>
          </div>
        </div>
      </form>
    </div>
  );
};
