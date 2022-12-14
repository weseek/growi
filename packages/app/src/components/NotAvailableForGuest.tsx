import React from 'react';

import { useTranslation } from 'next-i18next';
import { Disable } from 'react-disable';
import { UncontrolledTooltip } from 'reactstrap';

import { useIsGuestUser } from '~/stores/context';

type NotAvailableForGuestProps = {
  children: JSX.Element
}

export const NotAvailableForGuest = ({ children }: NotAvailableForGuestProps): JSX.Element => {
  const { t } = useTranslation();

  const { data: isGuestUser } = useIsGuestUser();
  const isDisabled = !!isGuestUser;

  const id = children.props.id || `grw-not-available-for-guest-${Math.random().toString(32).substring(2)}`;

  // clone and add className
  const clonedChild = React.cloneElement(children, {
    id,
    className: `${children.props.className} grw-not-available-for-guest`,
  });


  return (
    <>
      <div id={id}>
        <Disable disabled={isDisabled}>
          { clonedChild }
        </Disable>
      </div>
      <UncontrolledTooltip placement="top" target={id}>{t('Not available for guest')}</UncontrolledTooltip>
    </>
  );
};
