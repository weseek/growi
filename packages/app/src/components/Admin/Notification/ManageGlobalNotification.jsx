import React, { useCallback, useEffect, useState } from 'react';

import { useTranslation } from 'next-i18next';
import PropTypes from 'prop-types';

import AdminNotificationContainer from '~/client/services/AdminNotificationContainer';
import { toastError } from '~/client/util/apiNotification';
import { apiv3Get, apiv3Post, apiv3Put } from '~/client/util/apiv3-client';
import { useIsMailerSetup } from '~/stores/context';
import loggerFactory from '~/utils/logger';


import { withUnstatedContainers } from '../../UnstatedUtils';
import AdminUpdateButtonRow from '../Common/AdminUpdateButtonRow';

import TriggerEventCheckBox from './TriggerEventCheckBox';


const logger = loggerFactory('growi:manageGlobalNotification');


const ManageGlobalNotification = (props) => {
  const globalNotificationId = props.globalNotificationId || null;
  const [triggerPath, setTriggerPath] = useState('');
  const [notifyType, setNotifyType] = useState('mail');
  const [emailToSend, setEmailToSend] = useState('');
  const [slackChannelToSend, setSlackChannelToSend] = useState('');
  const [triggerEvents, setTriggerEvents] = useState(new Set());

  const retrieveGlobalNotificationData = useCallback(async() => {
    const response = await apiv3Get(`/notification-setting/global-notification/${globalNotificationId}`);
    const { globalNotification } = response.data;

    const notifyType = globalNotification.__t;
    setNotifyType(notifyType);

    setTriggerPath(globalNotification.triggerPath);
    setTriggerEvents(new Set(globalNotification.triggerEvents));

    if (notifyType === 'mail') {
      setEmailToSend(globalNotification.toEmail);
    }
    else {
      setSlackChannelToSend(globalNotification.slackChannels);
    }
  }, [globalNotificationId]);


  useEffect(() => {
    if (props.globalNotificationId != null) {
      retrieveGlobalNotificationData();
    }
  }, [props.globalNotificationId, retrieveGlobalNotificationData]);


  const onChangeTriggerEvents = useCallback((triggerEvent) => {
    let newTriggerEvents;

    if (triggerEvents.has(triggerEvent)) {
      newTriggerEvents = ([...triggerEvents].filter(item => item !== triggerEvent));
      setTriggerEvents(new Set(newTriggerEvents));
    }
    else {
      newTriggerEvents = [...triggerEvents, triggerEvent];
      setTriggerEvents(new Set(newTriggerEvents));
    }
  }, [triggerEvents]);


  const updateButtonClickedHandler = useCallback(async() => {
    const requestParams = {
      triggerPath,
      notifyType,
      toEmail: emailToSend,
      slackChannels: slackChannelToSend,
      triggerEvents: [...triggerEvents],
    };

    try {
      if (globalNotificationId != null) {
        await apiv3Put(`/notification-setting/global-notification/${globalNotificationId}`, requestParams);
      }
      else {
        await apiv3Post('/notification-setting/global-notification', requestParams);
      }
    }
    catch (err) {
      toastError(err);
      logger.error(err);
    }
  }, [emailToSend, globalNotificationId, notifyType, slackChannelToSend, triggerEvents, triggerPath]);


  const { data: isMailerSetup } = useIsMailerSetup();
  const { adminNotificationContainer } = props;
  const { t } = useTranslation('admin');

  return (
    <>
      <div className="my-3">
        <a href="/admin/notification#global-notification" className="btn btn-outline-secondary">
          <i className="icon-fw ti-arrow-left" aria-hidden="true"></i>
          {t('notification_settings.back_to_list')}
        </a>
      </div>


      <div className="row">
        <div className="form-box col-md-12">
          <h2 className="border-bottom mb-5">{t('notification_settings.notification_detail')}</h2>
        </div>

        <div className="col-sm-4">
          <h3 htmlFor="triggerPath">{t('notification_settings.trigger_path')}
            {/* eslint-disable-next-line react/no-danger */}
            <small dangerouslySetInnerHTML={{ __html: t('notification_settings.trigger_path_help', '<code>*</code>') }} />
          </h3>
          <div className="form-group">
            <input
              className="form-control"
              type="text"
              name="triggerPath"
              value={triggerPath}
              onChange={(e) => { setTriggerPath(e.target.value) }}
              required
            />
          </div>

          <h3>{t('notification_settings.notify_to')}</h3>
          <div className="form-group form-inline">
            <div className="custom-control custom-radio">
              <input
                className="custom-control-input"
                type="radio"
                id="mail"
                name="notifyType"
                value="mail"
                checked={notifyType === 'mail'}
                onChange={() => { setNotifyType('mail') }}
              />
              <label className="custom-control-label" htmlFor="mail">
                <p className="font-weight-bold">Email</p>
              </label>
            </div>
            <div className="custom-control custom-radio ml-2">
              <input
                className="custom-control-input"
                type="radio"
                id="slack"
                name="notifyType"
                value="slack"
                checked={notifyType === 'slack'}
                onChange={() => { setNotifyType('slack') }}
              />
              <label className="custom-control-label" htmlFor="slack">
                <p className="font-weight-bold">Slack</p>
              </label>
            </div>
          </div>

          {notifyType === 'mail'
            ? (
              <>
                <div className="input-group notify-to-option" id="mail-input">
                  <div className="input-group-prepend">
                    <span className="input-group-text" id="mail-addon"><i className="ti ti-email" /></span>
                  </div>
                  <input
                    className="form-control"
                    type="text"
                    aria-describedby="mail-addon"
                    name="toEmail"
                    placeholder="Email"
                    value={emailToSend}
                    onChange={(e) => { setEmailToSend(e.target.value) }}
                  />

                </div>

                <p className="p-2">
                  {/* eslint-disable-next-line react/no-danger */}
                  {!isMailerSetup && <span className="form-text text-muted" dangerouslySetInnerHTML={{ __html: t('admin:mailer_setup_required') }} />}
                  <b>Hint: </b>
                  <a href="https://ifttt.com/create" target="blank">{t('notification_settings.email.ifttt_link')}
                    <i className="icon-share-alt" />
                  </a>
                </p>
              </>
            )
            : (
              <>
                <div className="input-group notify-to-option" id="slack-input">
                  <div className="input-group-prepend">
                    <span className="input-group-text" id="slack-channel-addon"><i className="fa fa-hashtag" /></span>
                  </div>
                  <input
                    className="form-control"
                    type="text"
                    aria-describedby="slack-channel-addon"
                    name="notificationGlobal[slackChannels]"
                    placeholder="Slack Channel"
                    value={slackChannelToSend}
                    onChange={(e) => { setSlackChannelToSend(e.target.value) }}
                  />
                </div>
                <p className="p-2">
                  {/* eslint-disable-next-line react/no-danger */}
                  <span dangerouslySetInnerHTML={{ __html: t('notification_settings.channel_desc') }} />
                </p>
              </>
            )}
        </div>

        <div className="offset-1 col-sm-5">
          <div className="form-group">
            <h3>{t('notification_settings.trigger_events')}</h3>
            <div className="my-1">
              <TriggerEventCheckBox
                checkbox="success"
                event="pageCreate"
                checked={triggerEvents.has('pageCreate')}
                onChange={() => onChangeTriggerEvents('pageCreate')}
              >
                <span className="badge badge-pill badge-success">
                  <i className="icon-doc mr-1" /> CREATE
                </span>
              </TriggerEventCheckBox>
            </div>
            <div className="my-1">
              <TriggerEventCheckBox
                checkbox="warning"
                event="pageEdit"
                checked={triggerEvents.has('pageEdit')}
                onChange={() => onChangeTriggerEvents('pageEdit')}
              >
                <span className="badge badge-pill badge-warning">
                  <i className="icon-pencil mr-1" />EDIT
                </span>
              </TriggerEventCheckBox>
            </div>
            <div className="my-1">
              <TriggerEventCheckBox
                checkbox="pink"
                event="pageMove"
                checked={triggerEvents.has('pageMove')}
                onChange={() => onChangeTriggerEvents('pageMove')}
              >
                <span className="badge badge-pill badge-pink">
                  <i className="icon-action-redo mr-1" />MOVE
                </span>
              </TriggerEventCheckBox>
            </div>
            <div className="my-1">
              <TriggerEventCheckBox
                checkbox="danger"
                event="pageDelete"
                checked={triggerEvents.has('pageDelete')}
                onChange={() => onChangeTriggerEvents('pageDelete')}
              >
                <span className="badge badge-pill badge-danger">
                  <i className="icon-fire mr-1" />DELETE
                </span>
              </TriggerEventCheckBox>
            </div>
            <div className="my-1">
              <TriggerEventCheckBox
                checkbox="info"
                event="pageLike"
                checked={triggerEvents.has('pageLike')}
                onChange={() => onChangeTriggerEvents('pageLike')}
              >
                <span className="badge badge-pill badge-info">
                  <i className="fa fa-heart-o mr-1" />LIKE
                </span>
              </TriggerEventCheckBox>
            </div>
            <div className="my-1">
              <TriggerEventCheckBox
                checkbox="secondary"
                event="comment"
                checked={triggerEvents.has('comment')}
                onChange={() => onChangeTriggerEvents('comment')}
              >
                <span className="badge badge-pill badge-secondary">
                  <i className="icon-bubble mr-1" />POST
                </span>
              </TriggerEventCheckBox>
            </div>

          </div>
        </div>
      </div>

      <AdminUpdateButtonRow
        onClick={updateButtonClickedHandler}
        disabled={adminNotificationContainer.state.retrieveError != null}
      />
    </>
  );
};

ManageGlobalNotification.propTypes = {
  adminNotificationContainer: PropTypes.instanceOf(AdminNotificationContainer).isRequired,
  globalNotificationId: PropTypes.string,
};

const ManageGlobalNotificationWrapper = withUnstatedContainers(ManageGlobalNotification, [AdminNotificationContainer]);


export default ManageGlobalNotificationWrapper;
