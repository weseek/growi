import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Collapse } from 'reactstrap';
import installYourAppIntroductionImage from '../../../../../../public/images/slack-integration/slack-bot-install-your-app-introduction.png';
import installToWorkspaceImage from '../../../../../../public/images/slack-integration/slack-bot-install-to-workspace.png';
import installYourAppTransitionDestinationImage from '../../../../../../public/images/slack-integration/slack-bot-install-your-app-transition-destination.png';
import installYourAppCompleteImage from '../../../../../../public/images/slack-integration/slack-bot-install-your-app-complete.png';
import workspaceJoinedBotImage from '../../../../../../public/images/slack-integration/slack-bot-install-to-workspace-joined-bot.png';
import introductionToChannelImage from '../../../../../../public/images/slack-integration/slack-bot-install-your-app-introduction-to-channel.png';

const CustomBotWithoutSettingsAccordion = () => {
  const { t } = useTranslation('admin');
  const [currentlyOpenAccordionIndex, setCurrentlyOpenAccordionIndex] = useState(null);
  const onToggleAccordionHandler = (i) => {
    if (currentlyOpenAccordionIndex === i) {
      setCurrentlyOpenAccordionIndex(null);
      return;
    }
    setCurrentlyOpenAccordionIndex(i);
  };

  return (
    <div className="card border-0 rounded-lg shadow overflow-hidden" id="customBotWithoutProxySettingsAccordion">

      <div className="card border-0 rounded-lg mb-0">
        <div className="card-header clickable py-3 d-flex justify-content-between" onClick={() => onToggleAccordionHandler(0)}>
          <p className="mb-0 text-primary">{`① ${t('slack_integration.without_proxy.create_bot')}`}</p>
          {currentlyOpenAccordionIndex === 0
            ? <i className="fa fa-chevron-up" />
            : <i className="fa fa-chevron-down" />
          }
        </div>
        <Collapse isOpen={currentlyOpenAccordionIndex === 0}>
          <div className="card-body">

            <div className="row my-5">
              <div className="mx-auto">
                <div>
                  <button type="button" className="btn btn-primary text-nowrap mx-1" onClick={() => window.open('https://api.slack.com/apps', '_blank')}>
                    {t('slack_integration.without_proxy.create_bot')}
                    <i className="fa fa-external-link ml-2" aria-hidden="true" />
                  </button>
                </div>
                <a href="#">
                  <p className="text-center mt-1">
                    <small>
                      {t('slack_integration.without_proxy.how_to_create_a_bot')}
                      <i className="fa fa-external-link ml-2" aria-hidden="true" />
                    </small>
                  </p>
                </a>
              </div>
            </div>
          </div>
        </Collapse>
      </div>

      <div className="card border-0 rounded-lg mb-0">
        <div className="card-header clickable py-3 d-flex justify-content-between" onClick={() => onToggleAccordionHandler(1)}>
          <p className="mb-0 text-primary">{`② ${t('slack_integration.without_proxy.install_bot_to_slack')}`}</p>
          {currentlyOpenAccordionIndex === 1
            ? <i className="fa fa-chevron-up" />
            : <i className="fa fa-chevron-down" />
          }
        </div>
        <Collapse isOpen={currentlyOpenAccordionIndex === 1}>
          <div className="card-body px-3 py-4">
            <div className="container w-75">
              <p className="text-dark">1. Install your app をクリックします。</p>
              <img src={installYourAppIntroductionImage} className="border border-light img-fluid mb-4" />
              <p className="text-dark">2. Install to Workspace をクリックします。</p>
              <img src={installToWorkspaceImage} className="border border-light img-fluid mb-4" />
              <p className="text-dark">3. 遷移先の画面にて、Allowをクリックします。</p>
              <img src={installYourAppTransitionDestinationImage} className="border border-light img-fluid mb-4" />
              <p className="text-dark">4. Install your app の右側に 緑色のチェックがつけばワークスペースへのインストール完了です。</p>
              <img src={installYourAppCompleteImage} className="border border-light img-fluid mb-4" />
              <p className="text-dark">5. GROWI bot を使いたいチャンネルに @example を使用して招待します。</p>
              <img src={workspaceJoinedBotImage} className="border border-light img-fluid" />
              <img src={introductionToChannelImage} className="border border-light img-fluid" />
            </div>
          </div>
        </Collapse>
      </div>

      <div className="card border-0 rounded-lg mb-0">
        <div className="card-header clickable py-3 d-flex justify-content-between" onClick={() => onToggleAccordionHandler(2)}>
          <p className="mb-0 text-primary">{`③ ${t('slack_integration.without_proxy.register_secret_and_token')}`}</p>
          {currentlyOpenAccordionIndex === 2
            ? <i className="fa fa-chevron-up" />
            : <i className="fa fa-chevron-down" />
          }
        </div>
        <Collapse isOpen={currentlyOpenAccordionIndex === 2}>
          <div className="card-body">
            BODY 3
          </div>
        </Collapse>
      </div>

      <div className="card border-0 rounded-lg mb-0">
        <div className="card-header clickable py-3 d-flex justify-content-between" onClick={() => onToggleAccordionHandler(3)}>
          <p className="mb-0 text-primary">{`④ ${t('slack_integration.without_proxy.test_connection')}`}</p>
          {currentlyOpenAccordionIndex === 3
            ? <i className="fa fa-chevron-up" />
            : <i className="fa fa-chevron-down" />
          }
        </div>
        <Collapse isOpen={currentlyOpenAccordionIndex === 3}>
          <div className="card-body">
            BODY 4
          </div>
        </Collapse>
      </div>

    </div>

  );

};


export default CustomBotWithoutSettingsAccordion;
