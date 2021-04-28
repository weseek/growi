import React from 'react';
import Accordion from '../Common/Accordion';

const CustomBotWithProxySettingsAccordion = () => {

  return (
    <div className="card border-0 rounded-lg shadow overflow-hidden">
      <Accordion
        title={<><span className="mr-2">①</span>First Accordion</>}
      >
        1
      </Accordion>
      <Accordion
        title={<><span className="mr-2">②</span>Second Accordion</>}
      >
        2
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
