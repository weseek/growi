import React from 'react';
import 
import Accordion from '../Common/Accordion';

const CustomBotWithProxySettingsAccordion = () => {

  return (
    <div className="card border-0 rounded-lg shadow overflow-hidden">
      <Accordion
        title={<><span className="mr-2">①</span>First Accordion</>}
      >
        <div className="row my-5">
          <div className="mx-auto">
            <div>
              <button type="button" className="btn btn-primary text-nowrap mx-1" onClick={() => window.open('https://api.slack.com/apps', '_blank')}>
                {t('admin:slack_integration.accordion.create_bot')}
                <i className="fa fa-external-link ml-2" aria-hidden="true" />
              </button>
            </div>
            {/* TODO: Insert DOCS link */}
            <a href="#">
              <p className="text-center mt-1">
                <small>
                  {t('admin:slack_integration.accordion.how_to_create_a_bot')}
                  <i className="fa fa-external-link ml-2" aria-hidden="true" />
                </small>
              </p>
            </a>
          </div>
        </div>
      </Accordion>
      <Accordion
        title={<><span className="mr-2">②</span>Second Accordion</>}
      >
        <div className="row my-5">
          <div className="mx-auto">
            <div>
              <button type="button" className="btn btn-primary text-nowrap mx-1" onClick={() => window.open('https://api.slack.com/apps', '_blank')}>
                {t('admin:slack_integration.accordion.create_bot')}
                <i className="fa fa-external-link ml-2" aria-hidden="true" />
              </button>
            </div>
            {/* TODO: Insert DOCS link */}
            <a href="#">
              <p className="text-center mt-1">
                <small>
                  {t('admin:slack_integration.accordion.how_to_create_a_bot')}
                  <i className="fa fa-external-link ml-2" aria-hidden="true" />
                </small>
              </p>
            </a>
          </div>
        </div>
      </Accordion>
      <Accordion
        title={<><span className="mr-2">③</span>Third Accordion</>}
      >
        3
      </Accordion>
      <Accordion
        title={<><span className="mr-2">④</span>Fourth Accordion</>}
      >
        4
      </Accordion>
    </div>
  );
};

export default CustomBotWithProxySettingsAccordion;
