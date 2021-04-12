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
  const [openAccordionIndexes, setOpenAccordionIndexes] = useState(new Set());

  const onToggleAccordionHandler = (i) => {
    const accordionIndexes = new Set(openAccordionIndexes);
    if (accordionIndexes.has(i)) {
      accordionIndexes.delete(i);
    }
    else {
      accordionIndexes.add(i);
    }
    setOpenAccordionIndexes(accordionIndexes);
  };

  return (
    <div className="card border-0 rounded-lg shadow overflow-hidden">

      <div className="card border-0 rounded-lg mb-0">
        <div
          className="card-header font-weight-normal py-3 d-flex justify-content-between"
          role="button"
          onClick={() => onToggleAccordionHandler(0)}
        >
          <p className="mb-0 text-primary"><span className="mr-2">①</span>{t('slack_integration.without_proxy.create_bot')}</p>
          {openAccordionIndexes.has(0)
            ? <i className="fa fa-chevron-up" />
            : <i className="fa fa-chevron-down" />
          }
        </div>
        <Collapse isOpen={openAccordionIndexes.has(0)}>
          <div className="card-body">

            <div className="row my-5">
              <div className="mx-auto">
                <div>
                  <button type="button" className="btn btn-primary text-nowrap mx-1" onClick={() => window.open('https://api.slack.com/apps', '_blank')}>
                    {t('slack_integration.without_proxy.create_bot')}
                    <i className="fa fa-external-link ml-2" aria-hidden="true" />
                  </button>
                </div>
                {/* TODO: Insert DOCS link */}
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
        <div
          className="card-header font-weight-normal py-3 d-flex justify-content-between"
          role="button"
          onClick={() => onToggleAccordionHandler(1)}
        >
          <p className="mb-0 text-primary"><span className="mr-2">②</span>{t('slack_integration.without_proxy.install_bot_to_slack')}</p>
          {openAccordionIndexes.has(1)
            ? <i className="fa fa-chevron-up" />
            : <i className="fa fa-chevron-down" />
          }
        </div>
        <Collapse isOpen={currentlyOpenAccordionIndex === 1}>
          <div className="card-body py-5">
            <div className="container w-75">
              <p className="text-dark">1. Install your app をクリックします。</p>
              <img src={installYourAppIntroductionImage} className="border border-light img-fluid mb-5" />
              <p className="text-dark">2. Install to Workspace をクリックします。</p>
              <img src={installToWorkspaceImage} className="border border-light img-fluid mb-5" />
              <p className="text-dark">3. 遷移先の画面にて、Allowをクリックします。</p>
              <img src={installYourAppTransitionDestinationImage} className="border border-light img-fluid mb-5" />
              <p className="text-dark">4. Install your app の右側に 緑色のチェックがつけばワークスペースへのインストール完了です。</p>
              <img src={installYourAppCompleteImage} className="border border-light img-fluid mb-5" />
              <p className="text-dark">5. GROWI bot を使いたいチャンネルに @example を使用して招待します。</p>
              <img src={workspaceJoinedBotImage} className="border border-light img-fluid mb-1" />
              <img src={introductionToChannelImage} className="border border-light img-fluid" />
            </div>
          </div>
        </Collapse>
      </div>

      <div className="card border-0 rounded-lg mb-0">
        <div
          className="card-header font-weight-normal py-3 d-flex justify-content-between"
          role="button"
          onClick={() => onToggleAccordionHandler(2)}
        >
          <p className="mb-0 text-primary"><span className="mr-2">③</span>{t('slack_integration.without_proxy.register_secret_and_token')}</p>
          {openAccordionIndexes.has(2)
            ? <i className="fa fa-chevron-up" />
            : <i className="fa fa-chevron-down" />
          }
        </div>
        <Collapse isOpen={openAccordionIndexes.has(2)}>
          <div className="card-body">
            BODY 3
          </div>
        </Collapse>
      </div>

      <div className="card border-0 rounded-lg mb-0">
        <div
          className="card-header font-weight-normal py-3 d-flex justify-content-between"
          role="button"
          onClick={() => onToggleAccordionHandler(3)}
        >
          <p className="mb-0 text-primary"><span className="mr-2">④</span>{t('slack_integration.without_proxy.test_connection')}</p>
          {openAccordionIndexes.has(3)
            ? <i className="fa fa-chevron-up" />
            : <i className="fa fa-chevron-down" />
          }
        </div>
        <Collapse isOpen={openAccordionIndexes.has(3)}>
          <div className="card-body">
            <p className="text-dark">以下のテストボタンを押して、Slack連携が完了しているかの確認をしましょう</p>
            <button type="button" className="btn btn-info">Test</button>
            <p className="text-danger">エラーが発生しました。下記のログを確認してください。</p>

          </div>
        </Collapse>
      </div>

    </div>

  );

};


export default CustomBotWithoutSettingsAccordion;
