import React from 'react';
import { Collapse } from 'reactstrap';

const Group = ({children}) => (
  <div className="card border-0 rounded-lg mb-0">{children}</div>
)

const Header = ({children}) => (
  // <div className="card-header clickable py-3 d-flex justify-content-between" onClick={() => onToggleAccordionHandler(0)}>
  <div className="card-header clickable py-3 d-flex justify-content-between" onClick={() => onToggleAccordionHandler(0)}>
    <p className="mb-0 text-primary">{children}</p>
    {/* {currentlyOpenAccordionIndex === 0
      ? <i className="fa fa-chevron-up" />
      : <i className="fa fa-chevron-down" />
    } */}
  </div>
)

const Body = ({children}) => (
  // <Collapse isOpen={currentlyOpenAccordionIndex === 0}>
  <Collapse isOpen={true}>
    <div className="card-body">
      {children}
    </div>
  </Collapse>
)

const BotSettingsAccordion = (props) => {
  return (
    <div className="card border-0 rounded-lg shadow overflow-hidden">
      {props.children}
    </div>
  )

}

BotSettingsAccordion.Group = Group;
BotSettingsAccordion.Header = Header;
BotSettingsAccordion.Body = Body;

export default BotSettingsAccordion;
