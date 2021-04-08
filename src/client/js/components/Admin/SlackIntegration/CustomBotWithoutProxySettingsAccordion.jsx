import React from 'react';
import { useTranslation } from 'react-i18next';

const CustomBotWithoutSettingsAccordion = () => {
  const { t } = useTranslation('admin');

  return (
    <div className="accordion my-5" id="withoutProxySettingsAccordion">

      <div className="card mb-0">

        <div className="card-header" id="headingOne">
          <h2 className="mb-0">
            <button
              className="btn btn-link btn-block d-flex text-decoration-none"
              type="button"
              data-toggle="collapse"
              data-target="#collapsibleMakeBotSection"
            >
              ① Botを作成する
            </button>
          </h2>
        </div>

        <div id="collapsibleMakeBotSection" className="collapse show" data-parent="#withoutProxySettingsAccordion">
          <div className="card-body">
            Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid. 3 wolf moon officia aute, non cupidatat skateboard
            dolor brunch. Food truck quinoa nesciunt laborum eiusmod. Brunch 3 wolf moon tempor, sunt aliqua put a bird on it squid single-origin coffee nulla
            assumenda shoreditch et. Nihil anim keffiyeh helvetica, craft beer labore wes anderson cred nesciunt sapiente ea proident. Ad vegan excepteur
            butcher vice lomo. Leggings occaecat craft beer farm-to-table, raw denim aesthetic synth nesciunt you probably havent heard of them accusamus
            labore sustainable VHS.
          </div>
        </div>

      </div>

      <div className="card mb-0">

        <div className="card-header" id="headingTwo">
          <h2 className="mb-0">
            <button
              className="btn btn-link btn-block d-flex text-decoration-none"
              type="button"
              data-toggle="collapse"
              data-target="#collapsibleInstallBotSection"
            >
              ② BotをSlackにインストールする
            </button>
          </h2>
        </div>

        <div id="collapsibleInstallBotSection" className="collapse" data-parent="#withoutProxySettingsAccordion">
          <div className="card-body">
            Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid. 3 wolf moon officia aute, non cupidatat skateboard
            dolor brunch. Food truck quinoa nesciunt laborum eiusmod. Brunch 3 wolf moon tempor, sunt aliqua put a bird on it squid single-origin coffee nulla
            assumenda shoreditch et. Nihil anim keffiyeh helvetica, craft beer labore wes anderson cred nesciunt sapiente ea proident. Ad vegan excepteur
            butcher vice lomo. Leggings occaecat craft beer farm-to-table, raw denim aesthetic synth nesciunt you probably havent heard of them accusamus
            labore sustainable VHS.
          </div>
        </div>

      </div>

      <div className="card mb-0">

        <div className="card-header" id="headingTwo">
          <h2 className="mb-0">
            <button
              className="btn btn-link btn-block d-flex text-decoration-none"
              type="button"
              data-toggle="collapse"
              data-target="#collapsibleSecretTokenSection"
            >
              ③ Signing Secret と Bot Token を登録する
            </button>
          </h2>
        </div>

        <div id="collapsibleSecretTokenSection" className="collapse" data-parent="#withoutProxySettingsAccordion">
          <div className="card-body">
            Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid. 3 wolf moon officia aute, non cupidatat skateboard
            dolor brunch. Food truck quinoa nesciunt laborum eiusmod. Brunch 3 wolf moon tempor, sunt aliqua put a bird on it squid single-origin coffee nulla
            assumenda shoreditch et. Nihil anim keffiyeh helvetica, craft beer labore wes anderson cred nesciunt sapiente ea proident. Ad vegan excepteur
            butcher vice lomo. Leggings occaecat craft beer farm-to-table, raw denim aesthetic synth nesciunt you probably havent heard of them accusamus
            labore sustainable VHS.
          </div>
        </div>

      </div>

      <div className="card mb-0">

        <div className="card-header" id="headingTwo">
          <h2 className="mb-0">
            <button
              className="btn btn-link btn-block d-flex text-decoration-none"
              type="button"
              data-toggle="collapse"
              data-target="#collapsibleTestConnectionSection"
            >
              ④ 連携状況のテストをする
            </button>
          </h2>
        </div>

        <div id="collapsibleTestConnectionSection" className="collapse" data-parent="#withoutProxySettingsAccordion">
          <div className="card-body">
            Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid. 3 wolf moon officia aute, non cupidatat skateboard
            dolor brunch. Food truck quinoa nesciunt laborum eiusmod. Brunch 3 wolf moon tempor, sunt aliqua put a bird on it squid single-origin coffee nulla
            assumenda shoreditch et. Nihil anim keffiyeh helvetica, craft beer labore wes anderson cred nesciunt sapiente ea proident. Ad vegan excepteur
            butcher vice lomo. Leggings occaecat craft beer farm-to-table, raw denim aesthetic synth nesciunt you probably havent heard of them accusamus
            labore sustainable VHS.
          </div>
        </div>

      </div>

      {/* <div className="row my-5">
        <div className="mx-auto">
          <button type="button" className="btn btn-primary text-nowrap mx-1" onClick={() => window.open('https://api.slack.com/apps', '_blank')}>
            {t('slack_integration.without_proxy.create_bot')}
          </button>
        </div>
      </div> */}
    </div>

  );

};


export default CustomBotWithoutSettingsAccordion;
