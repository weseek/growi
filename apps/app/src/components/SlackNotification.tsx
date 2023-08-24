/* eslint-disable react/prop-types */
import React, { FC } from 'react';

import { useTranslation } from 'next-i18next';
import { PopoverBody, PopoverHeader, UncontrolledPopover } from 'reactstrap';

import styles from './SlackNotification.module.scss';


type SlackNotificationProps = {
  id: string;
  isSlackEnabled: boolean;
  slackChannels: string;
  onEnabledFlagChange?: (isSlackEnabled: boolean) => void;
  onChannelChange?: (value: string) => void;
};

export const SlackNotification: FC<SlackNotificationProps> = ({
  id, isSlackEnabled, slackChannels, onEnabledFlagChange, onChannelChange,
}) => {
  const { t } = useTranslation();
  const idForSlackPopover = `${id}ForSlackPopover`;

  const updateCheckboxHandler = (event: { target: { checked: boolean }; }) => {
    const value = event.target.checked;
    if (onEnabledFlagChange != null) {
      onEnabledFlagChange(value);
    }
  };

  const updateSlackChannelsHandler = (event: { target: { value: string } }) => {
    const value = event.target.value;
    if (onChannelChange != null) {
      onChannelChange(value);
    }
  };


  return (
    <div className={`grw-slack-notification ${styles['grw-slack-notification']} w-100`}>
      <div className="grw-input-group-slack-notification input-group extended-setting">
        <label className="form-label input-group-addon">
          <div className="custom-control custom-switch custom-switch-lg custom-switch-slack">
            <input
              type="checkbox"
              className="custom-control-input border-0"
              id={id}
              checked={isSlackEnabled}
              onChange={updateCheckboxHandler}
            />
            <label className="form-label custom-control-label align-center" htmlFor={id}></label>
          </div>
        </label>
        <input
          className="grw-form-control-slack-notification form-control align-top pl-0"
          id={idForSlackPopover}
          type="text"
          value={slackChannels}
          placeholder="Input channels"
          onChange={updateSlackChannelsHandler}
        />
        <UncontrolledPopover trigger="focus" placement="top" target={idForSlackPopover}>
          <PopoverHeader>{t('slack_notification.popover_title')}</PopoverHeader>
          <PopoverBody>{t('slack_notification.popover_desc')}</PopoverBody>
        </UncontrolledPopover>
      </div>
    </div>

  );
};
