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

  const id = `grw-not-available-for-guest-${Math.random().toString(32).substring(2)}`;

  return (
    <>
      <div id={id}>
        <Disable disabled={isDisabled}>
          { children }
        </Disable>
      </div>
      <UncontrolledTooltip placement="top" target={id}>{t('Not available for guest')}</UncontrolledTooltip>
    </>
  );
};
