import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { withUnstatedContainers } from '../../UnstatedUtils';
import Accordion from '../Common/Accordion';

export const botInstallationStep = {
  CREATE_BOT: 'create-bot',
  INSTALL_BOT: 'install-bot',
  REGISTER_SLACK_CONFIGURATION: 'register-slack-configuration',
  CONNECTION_TEST: 'connection-test',
};

const CustomBotWithProxySettingsAccordion = ({ activeStep }) => {
  const [defaultOpenAccordionKeys, setDefaultOpenAccordionKeys] = useState(new Set([activeStep]));

  return (
    <div className="card border-0 rounded-lg shadow overflow-hidden">
      <Accordion
        defaultIsActive={defaultOpenAccordionKeys.has(botInstallationStep.CREATE_BOT)}
        title={<><span className="mr-2">①</span>First Accordion</>}
      >
        1
      </Accordion>
      <Accordion
        defaultIsActive={defaultOpenAccordionKeys.has(botInstallationStep.INSTALL_BOT)}
        title={<><span className="mr-2">②</span>Second Accordion</>}
      >
        2
      </Accordion>
      <Accordion
        defaultIsActive={defaultOpenAccordionKeys.has(botInstallationStep.REGISTER_SLACK_CONFIGURATION)}
        title={<><span className="mr-2">③</span>Third Accordion</>}
      >
        3
      </Accordion>
      <Accordion
        defaultIsActive={defaultOpenAccordionKeys.has(botInstallationStep.CONNECTION_TEST)}
        title={<><span className="mr-2">④</span>Fourth Accordion</>}
      >
        4
      </Accordion>
    </div>
  );
};

const CustomBotWithProxySettingsAccordionWrapper = withUnstatedContainers(CustomBotWithProxySettingsAccordion);

CustomBotWithProxySettingsAccordion.propTypes = {
  activeStep: PropTypes.oneOf(Object.values(botInstallationStep)).isRequired,
};

export default CustomBotWithProxySettingsAccordionWrapper;
