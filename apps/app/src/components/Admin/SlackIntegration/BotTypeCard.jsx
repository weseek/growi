import React from 'react';

import { SlackbotType } from '@growi/slack';
import { useTranslation } from 'next-i18next';
import PropTypes from 'prop-types';

const botDetails = {
  officialBot: {
    botType: SlackbotType.OFFICIAL,
    botTypeCategory: 'official_bot',
    setUp: 'easy',
    multiWSIntegration: 'possible',
    securityControl: 'impossible',
  },
  customBotWithoutProxy: {
    botType: SlackbotType.CUSTOM_WITHOUT_PROXY,
    botTypeCategory: 'custom_bot',
    supplementaryBotName: 'without_proxy',
    setUp: 'normal',
    multiWSIntegration: 'impossible',
    securityControl: 'possible',
  },
  customBotWithProxy: {
    botType: SlackbotType.CUSTOM_WITH_PROXY,
    botTypeCategory: 'custom_bot',
    supplementaryBotName: 'with_proxy',
    setUp: 'hard',
    multiWSIntegration: 'possible',
    securityControl: 'possible',
  },
};

const BotTypeCard = (props) => {
  const { t } = useTranslation();

  const isBotTypeOfficial = props.botType === SlackbotType.OFFICIAL;

  return (
    <div
      className={`card admin-bot-card rounded border-radius-sm shadow ${props.isActive ? 'border-primary' : ''}`}
      onClick={() => props.onBotTypeSelectHandler(botDetails[props.botType].botType)}
      role="button"
      key={props.botType}
    >
      <div>
        <h3 className={`card-header mb-0 py-3
              ${isBotTypeOfficial ? 'd-flex align-items-center justify-content-center' : 'text-center'}
              ${props.isActive ? 'bg-primary grw-botcard-title-active' : ''}`}
        >
          <span className="mr-2">
            {t(`admin:slack_integration.selecting_bot_types.${botDetails[props.botType].botTypeCategory}`)}
          </span>

          {/*  A recommended badge is shown on official bot card, supplementary names are shown on Custom bot cards   */}
          { isBotTypeOfficial
            ? (
              <span className="badge badge-info mr-2">
                {t('admin:slack_integration.selecting_bot_types.recommended')}
              </span>
            ) : (
              <span className="supplementary-bot-name mr-2">
                {t(`admin:slack_integration.selecting_bot_types.${botDetails[props.botType].supplementaryBotName}`)}
              </span>
            )}

          <i className={props.isActive ? 'grw-botcard-title-active' : ''} aria-hidden="true"></i>
        </h3>
      </div>
      <div className="card-body p-4">
        <div className="card-text">
          <div className="my-2">
            <img
              className="bot-difficulty-icon d-block mx-auto mb-4"
              src={`/images/slack-integration/slackbot-difficulty-level-${botDetails[props.botType].setUp}.svg`}
            />
            <div className="d-flex justify-content-between mb-3">
              <span>{t('admin:slack_integration.selecting_bot_types.multiple_workspaces_integration')}</span>
              <img className="bot-type-disc" src={`/images/slack-integration/${botDetails[props.botType].multiWSIntegration}.png`} alt="" />
            </div>
            <div className="d-flex justify-content-between">
              <span>{t('admin:slack_integration.selecting_bot_types.security_control')}</span>
              <img className="bot-type-disc" src={`/images/slack-integration/${botDetails[props.botType].securityControl}.png`} alt="" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

};

BotTypeCard.propTypes = {
  isActive: PropTypes.bool.isRequired,
  botType: PropTypes.string.isRequired,
  onBotTypeSelectHandler: PropTypes.func.isRequired,
};

export default BotTypeCard;
