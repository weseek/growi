/* eslint-disable react/prop-types */
import type { FC } from 'react';

import { useTranslation } from 'next-i18next';
import {
  FormGroup, Input, InputGroup, InputGroupText,
  PopoverBody, PopoverHeader, UncontrolledPopover,
} from 'reactstrap';

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
    // <div className={`grw-slack-notification ${styles['grw-slack-notification']} w-100`}>
    //   <div className="grw-input-group-slack-notification input-group extended-setting">
    //     <label className="form-label input-group-addon m-0">
    //       <div className="form-check form-switch form-switch-lg form-switch-slack">
    //         <input
    //           type="checkbox"
    //           className="form-check-input border-0"
    //           id={id}
    //           checked={isSlackEnabled}
    //           onChange={updateCheckboxHandler}
    //         />
    //         <label className="form-label form-check-label align-center" htmlFor={id}></label>
    //       </div>
    //     </label>
    //     <Form>
    //       <FormGroup switch>
    //         <Input type="switch" role="switch">
    //           <p>kohsei</p>
    //         </Input>
    //       </FormGroup>
    //     </Form>
    //     <input
    //       className="grw-form-control-slack-notification form-control align-top ps-0 h-100"
    //       id={idForSlackPopover}
    //       type="text"
    //       value={slackChannels}
    //       placeholder="Input channels"
    //       onChange={updateSlackChannelsHandler}
    //     />
    //     <UncontrolledPopover trigger="focus" placement="top" target={idForSlackPopover}>
    //       <PopoverHeader>{t('slack_notification.popover_title')}</PopoverHeader>
    //       <PopoverBody>{t('slack_notification.popover_desc')}</PopoverBody>
    //     </UncontrolledPopover>
    //   </div>
    // </div>
    // <div className={`grw-slack-notification ${styles['grw-slack-notification']} w-100`}>
    //   <div className="grw-input-group-slack-notification input-group extended-setting">
    //     <label className="input-group-addon">
    //       <div className="form-check form-switch form-switch-lg form-switch-slack">
    //         <input
    //           type="checkbox"
    //           className="form-check-input border-0"
    //           id={id}
    //           checked={isSlackEnabled}
    //           onChange={updateCheckboxHandler}
    //         />
    //         <label className="form-check-label align-center" htmlFor={id}></label>
    //       </div>
    //     </label>
    //     <input
    //       className="grw-form-control-slack-notification form-control align-top pl-0"
    //       id={idForSlackPopover}
    //       type="text"
    //       value={slackChannels}
    //       placeholder="Input channels"
    //       onChange={updateSlackChannelsHandler}
    //     />
    //     <UncontrolledPopover trigger="focus" placement="top" target={idForSlackPopover}>
    //       <PopoverHeader>{t('slack_notification.popover_title')}</PopoverHeader>
    //       <PopoverBody>{t('slack_notification.popover_desc')}</PopoverBody>
    //     </UncontrolledPopover>
    //   </div>
    // </div>
    <InputGroup className={`d-flex align-items-stretch  ${styles['grw-slack-switch']}`}>
      <InputGroupText className="rounded-end rounded-pill d-flex flex-column align-items-stretch">
        <FormGroup switch className="position-relative pe-2 m-0">
          <Input
            className="position-absolute top-0 end-0 p-0 m-0 w-100 h-100 border-0"
            type="switch"
            role="switch"
            id={id}
            checked={isSlackEnabled}
            onChange={updateCheckboxHandler}
          />
        </FormGroup>
      </InputGroupText>
      <Input
        className="rounded-start rounded-pill"
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
    </InputGroup>
  );
};
