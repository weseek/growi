import React, {
  useCallback, useMemo, useEffect, useState,
} from 'react';

import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { NotifyType, TriggerEventType } from '~/client/interfaces/global-notification';
import { apiv3Post } from '~/client/util/apiv3-client';
import { toastError } from '~/client/util/toastr';
import { useIsMailerSetup } from '~/stores/context';
import { useSWRxGlobalNotification } from '~/stores/global-notification';
import loggerFactory from '~/utils/logger';


import AdminUpdateButtonRow from '../Common/AdminUpdateButtonRow';

import TriggerEventCheckBox from './TriggerEventCheckBox';


const logger = loggerFactory('growi:manageGlobalNotification');


type Props = {
  globalNotificationId?: string,
}

const ManageGlobalNotification = (props: Props): JSX.Element => {

  const [triggerPath, setTriggerPath] = useState('');
  const [notifyType, setNotifyType] = useState<NotifyType>(NotifyType.Email);
  const [emailToSend, setEmailToSend] = useState('');
  const [slackChannelToSend, setSlackChannelToSend] = useState('');
  const [triggerEvents, setTriggerEvents] = useState(new Set());
  const { data: globalNotificationData, update: updateGlobalNotification } = useSWRxGlobalNotification(props.globalNotificationId || '');
  const globalNotification = useMemo(() => globalNotificationData?.globalNotification, [globalNotificationData?.globalNotification]);

  const router = useRouter();


  useEffect(() => {
    if (globalNotification != null) {
      const notifyType = globalNotification.__t;
      setNotifyType(notifyType);

      setTriggerPath(globalNotification.triggerPath);
      setTriggerEvents(new Set(globalNotification.triggerEvents));

      if (notifyType === NotifyType.Email) {
        setEmailToSend(globalNotification.toEmail);
      }
      else {
        setSlackChannelToSend(globalNotification.slackChannels);
      }
    }
  }, [globalNotification]);

  const isLoading = globalNotificationData === undefined;
  const notExistsGlobalNotification = !isLoading && globalNotificationData == null;

  useEffect(() => {
    if (notExistsGlobalNotification) {
      router.push('/admin/notification');
    }
  }, [notExistsGlobalNotification, router]);


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
      if (props.globalNotificationId != null) {
        await updateGlobalNotification(requestParams);
        router.push('/admin/notification');
      }
      else {
        await apiv3Post('/notification-setting/global-notification', requestParams);
        router.push('/admin/notification');
      }
    }
    catch (err) {
      toastError(err);
      logger.error(err);
    }
  }, [emailToSend, notifyType, props.globalNotificationId, router, slackChannelToSend, triggerEvents, triggerPath, updateGlobalNotification]);


  const { data: isMailerSetup } = useIsMailerSetup();
  const { t } = useTranslation('admin');

  return (
    <>
      <div className="my-3">
        <Link href="/admin/notification" className="btn btn-outline-secondary">
          <i className="icon-fw ti ti-arrow-left" aria-hidden="true"></i>
          {t('notification_settings.back_to_list')}
        </Link>
      </div>


      <div className="row">
        <div className="form-box col-md-12">
          <h2 className="border-bottom mb-5">{t('notification_settings.notification_detail')}</h2>
        </div>

        <div className="col-sm-4">
          <h3>
            <label htmlFor="triggerPath">{t('notification_settings.trigger_path')}
              {/* eslint-disable-next-line react/no-danger */}
              <small dangerouslySetInnerHTML={{ __html: t('notification_settings.trigger_path_help', '<code>*</code>') }} />
            </label>
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
                checked={notifyType === NotifyType.Email}
                onChange={() => { setNotifyType(NotifyType.Email) }}
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
                checked={notifyType === NotifyType.SLACK}
                onChange={() => { setNotifyType(NotifyType.SLACK) }}
              />
              <label className="custom-control-label" htmlFor="slack">
                <p className="font-weight-bold">Slack</p>
              </label>
            </div>
          </div>

          {notifyType === NotifyType.Email
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
                event={TriggerEventType.CREATE}
                checked={triggerEvents.has(TriggerEventType.CREATE)}
                onChange={() => onChangeTriggerEvents(TriggerEventType.CREATE)}
              >
                <span className="badge badge-pill badge-success">
                  <i className="icon-doc mr-1" /> CREATE
                </span>
              </TriggerEventCheckBox>
            </div>
            <div className="my-1">
              <TriggerEventCheckBox
                checkbox="warning"
                event={TriggerEventType.EDIT}
                checked={triggerEvents.has(TriggerEventType.EDIT)}
                onChange={() => onChangeTriggerEvents(TriggerEventType.EDIT)}
              >
                <span className="badge badge-pill badge-warning">
                  <i className="icon-pencil mr-1" />EDIT
                </span>
              </TriggerEventCheckBox>
            </div>
            <div className="my-1">
              <TriggerEventCheckBox
                checkbox="pink"
                event={TriggerEventType.MOVE}
                checked={triggerEvents.has(TriggerEventType.MOVE)}
                onChange={() => onChangeTriggerEvents(TriggerEventType.MOVE)}
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
                checked={triggerEvents.has(TriggerEventType.DELETE)}
                onChange={() => onChangeTriggerEvents(TriggerEventType.DELETE)}
              >
                <span className="badge badge-pill badge-danger">
                  <i className="icon-fire mr-1" />DELETE
                </span>
              </TriggerEventCheckBox>
            </div>
            <div className="my-1">
              <TriggerEventCheckBox
                checkbox="info"
                event={TriggerEventType.LIKE}
                checked={triggerEvents.has(TriggerEventType.LIKE)}
                onChange={() => onChangeTriggerEvents(TriggerEventType.LIKE)}
              >
                <span className="badge badge-pill badge-info">
                  <i className="fa fa-heart-o mr-1" />LIKE
                </span>
              </TriggerEventCheckBox>
            </div>
            <div className="my-1">
              <TriggerEventCheckBox
                checkbox="secondary"
                event={TriggerEventType.POST}
                checked={triggerEvents.has(TriggerEventType.POST)}
                onChange={() => onChangeTriggerEvents(TriggerEventType.POST)}
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
        disabled={false}
      />
    </>
  );
};

export default ManageGlobalNotification;
