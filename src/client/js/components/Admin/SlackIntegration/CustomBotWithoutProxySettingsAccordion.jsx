import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Collapse } from 'reactstrap';

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
          <div className="card-body">
            BODY2
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
