import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Collapse } from 'reactstrap';

const CustomBotWithoutSettingsAccordion = () => {
  const { t } = useTranslation('admin');
  const [currentlyOpenAccordionIndexes, setCurrentlyOpenAccordionIndexes] = useState([]);
  const onToggleAccordionHandler = (i) => {
    if (currentlyOpenAccordionIndexes.includes(i)) {
      setCurrentlyOpenAccordionIndexes(currentlyOpenAccordionIndexes.filter(n => n !== i));
      return;
    }
    setCurrentlyOpenAccordionIndexes([...currentlyOpenAccordionIndexes, i]);
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
          {currentlyOpenAccordionIndexes.includes(0)
            ? <i className="fa fa-chevron-up" />
            : <i className="fa fa-chevron-down" />
          }
        </div>
        <Collapse isOpen={currentlyOpenAccordionIndexes.includes(0)}>
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
          {currentlyOpenAccordionIndexes.includes(1)
            ? <i className="fa fa-chevron-up" />
            : <i className="fa fa-chevron-down" />
          }
        </div>
        <Collapse isOpen={currentlyOpenAccordionIndexes.includes(1)}>
          <div className="card-body">
            BODY2
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
          {currentlyOpenAccordionIndexes.includes(2)
            ? <i className="fa fa-chevron-up" />
            : <i className="fa fa-chevron-down" />
          }
        </div>
        <Collapse isOpen={currentlyOpenAccordionIndexes.includes(2)}>
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
          {currentlyOpenAccordionIndexes.includes(3)
            ? <i className="fa fa-chevron-up" />
            : <i className="fa fa-chevron-down" />
          }
        </div>
        <Collapse isOpen={currentlyOpenAccordionIndexes.includes(3)}>
          <div className="card-body">
            BODY 4
          </div>
        </Collapse>
      </div>

    </div>

  );

};


export default CustomBotWithoutSettingsAccordion;
