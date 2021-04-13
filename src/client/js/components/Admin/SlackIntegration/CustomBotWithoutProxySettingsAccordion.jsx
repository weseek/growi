import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import BotSettingsAccordion from './BotSettingsAccordion';

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
    <BotSettingsAccordion>
      <BotSettingsAccordion.Item
        isActive={openAccordionIndexes.has(0)}
        itemNumber="①"
        title="asdfasdfasdf"
        onToggleAccordionHandler={() => onToggleAccordionHandler(0)}
      >
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
      </BotSettingsAccordion.Item>
      <BotSettingsAccordion.Item
        isActive={openAccordionIndexes.has(1)}
        itemNumber="②"
        title="asdfasdfasdf"
        onToggleAccordionHandler={() => onToggleAccordionHandler(1)}
      >
        ボディー
      </BotSettingsAccordion.Item>
      <BotSettingsAccordion.Item
        isActive={openAccordionIndexes.has(2)}
        itemNumber="③"
        title="asdfasdfasdf"
        onToggleAccordionHandler={() => onToggleAccordionHandler(2)}
      >
        ボディー
      </BotSettingsAccordion.Item>
      <BotSettingsAccordion.Item
        isActive={openAccordionIndexes.has(3)}
        itemNumber="④"
        title="asdfasdfasdf"
        onToggleAccordionHandler={() => onToggleAccordionHandler(3)}
      >
        ボディー
      </BotSettingsAccordion.Item>
    </BotSettingsAccordion>

  );

};


export default CustomBotWithoutSettingsAccordion;
