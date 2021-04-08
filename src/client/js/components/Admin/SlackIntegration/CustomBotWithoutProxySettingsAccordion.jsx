import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Collapse } from 'reactstrap';

const CustomBotWithoutSettingsAccordion = () => {
  const { t } = useTranslation('admin');
  const [currentlyOpenAccordionIndex, setCurrentlyOpenAccordionIndex] = useState(false);
  const toggleAccordion = (i) => {
    setCurrentlyOpenAccordionIndex(i);
  };

  return (
    <div className="card rounded border-0 shadow" id="customBotWithoutProxySettingsAccordion">
      <div className="card border-0 mb-0 rounded-top">
        <div className="card-header clickable rounded-top" onClick={() => toggleAccordion(0)}>
        ① {t('slack_integration.without_proxy.create_bot')}
        </div>
        <Collapse isOpen={currentlyOpenAccordionIndex === 0}>
          <div className="card-body">
          BODY 1
          </div>
        </Collapse>
      </div>
      <div className="card border-0 mb-0">
        <div className="card-header clickable" onClick={() => toggleAccordion(1)}>
        ② {t('slack_integration.without_proxy.install_bot_to_slack')}
        </div>
        <Collapse isOpen={currentlyOpenAccordionIndex === 1}>
          <div className="card-body">
          BODY 2
          </div>
        </Collapse>
      </div>
      <div className="card border-0 mb-0">
        <div className="card-header clickable" onClick={() => toggleAccordion(2)}>
        ③ {t('slack_integration.without_proxy.register_secret_and_token')}
        </div>
        <Collapse isOpen={currentlyOpenAccordionIndex === 2}>
          <div className="card-body">
          BODY 3
          </div>
        </Collapse>
      </div>
      <div className="card border-0 mb-0 rounded-bottom">
        <div className="card-header clickable rounded-bottom" onClick={() => toggleAccordion(3)}>
        ④ {t('slack_integration.without_proxy.test_connection')}
        </div>
        <Collapse isOpen={currentlyOpenAccordionIndex === 3}>
          <div className="card-body rounded-bottom">
          BODY 4
          </div>
        </Collapse>
      </div>

    </div>

  );

};


export default CustomBotWithoutSettingsAccordion;
