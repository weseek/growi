import React from 'react';

import { Disable } from 'react-disable';
import type { UncontrolledTooltipProps } from 'reactstrap';
import { UncontrolledTooltip } from 'reactstrap';

type NotAvailableProps = {
  children: React.ReactElement
  isDisabled: boolean
  title: string
  classNamePrefix?: string
  placement?: UncontrolledTooltipProps['placement']
}

export const NotAvailable = ({
  children, isDisabled, title, classNamePrefix = 'grw-not-available', placement = 'top',
}: NotAvailableProps): React.ReactElement => {

  if (!isDisabled) {
    return children;
  }

  const id = `${classNamePrefix}-${Math.random().toString(32).substring(2)}`;

  return (
    <>
      <div id={id}>
        <Disable disabled={isDisabled}>
          {children}
        </Disable>
      </div>
      <UncontrolledTooltip placement={placement} target={id}>{title}</UncontrolledTooltip>
    </>
  );
};
