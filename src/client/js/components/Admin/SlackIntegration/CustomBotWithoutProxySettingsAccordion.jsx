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
              className="btn btn-link btn-block d-flex justify-content-between text-decoration-none"
              type="button"
              data-toggle="collapse"
              data-target="#collapseOne"
              aria-expanded="true"
              aria-controls="collapseOne"
            >
              ① Botを作成する
              <i className="fa fa-chevron-down"></i>
            </button>
          </h2>
        </div>

        <div id="collapseOne" className="collapse show" aria-labelledby="headingOne" data-parent="#withoutProxySettingsAccordion" onChange={e => {console.log('Event fired')}}>
          <div className="card-body">
            <div className="row my-5">
              <div className="mx-auto">
                <button type="button" className="btn btn-primary text-nowrap mx-1" onClick={() => window.open('https://api.slack.com/apps', '_blank')}>
                  {t('slack_integration.without_proxy.create_bot')}
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

      <div className="card mb-0">

        <div className="card-header" id="headingTwo">
          <h2 className="mb-0">
            <button
              className="btn btn-link btn-block d-flex justify-content-between text-decoration-none"
              type="button"
              data-toggle="collapse"
              data-target="#collapseTwo"
              aria-expanded="false"
              aria-controls="collapseTwo"
            >
              ② BotをSlackにインストールする
              <i className="fa fa-chevron-down"></i>
            </button>
          </h2>
        </div>

        <div id="collapseTwo" className="collapse" aria-labelledby="headingTwo" data-parent="#withoutProxySettingsAccordion">
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

        <div className="card-header" id="headingThree">
          <h2 className="mb-0">
            <button
              className="btn btn-link btn-block d-flex justify-content-between text-decoration-none"
              type="button"
              data-toggle="collapse"
              data-target="#collapseThree"
              aria-expanded="false"
              aria-controls="collapseThree"
            >
              ③ Signing SecretとBot Tokenを登録する
              <i className="fa fa-chevron-down"></i>
            </button>
          </h2>
        </div>

        <div id="collapseThree" className="collapse" aria-labelledby="headingThree" data-parent="#withoutProxySettingsAccordion">
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

        <div className="card-header" id="headingFour">
          <h2 className="mb-0">
            <button
              className="btn btn-link btn-block d-flex justify-content-between text-decoration-none"
              type="button"
              data-toggle="collapse"
              data-target="#collapseFour"
              aria-expanded="false"
              aria-controls="collapseFour"
            >
              ④ 連携状況のテストをする
              <i className="fa fa-chevron-down"></i>
            </button>
          </h2>
        </div>

        <div id="collapseFour" className="collapse" aria-labelledby="headingFour" data-parent="#withoutProxySettingsAccordion">
          <div className="card-body">
            Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid. 3 wolf moon officia aute, non cupidatat skateboard
            dolor brunch. Food truck quinoa nesciunt laborum eiusmod. Brunch 3 wolf moon tempor, sunt aliqua put a bird on it squid single-origin coffee nulla
            assumenda shoreditch et. Nihil anim keffiyeh helvetica, craft beer labore wes anderson cred nesciunt sapiente ea proident. Ad vegan excepteur
            butcher vice lomo. Leggings occaecat craft beer farm-to-table, raw denim aesthetic synth nesciunt you probably havent heard of them accusamus
            labore sustainable VHS.
          </div>
        </div>

      </div>

    </div>

  );

};


export default CustomBotWithoutSettingsAccordion;
