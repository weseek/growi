import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import urljoin from 'url-join';

import loggerFactory from '~/utils/logger';

import { toastError } from '../../../util/apiNotification';

import TriggerEventCheckBox from './TriggerEventCheckBox';
import AdminUpdateButtonRow from '~/components/Admin/Common/AdminUpdateButtonRow';
import { apiv3Post, apiv3Put } from '~/utils/apiv3-client';
// import { useIsMailerSetup } from '~/stores/context';

const logger = loggerFactory('growi:manageGlobalNotification');

class ManageGlobalNotification extends React.Component {

  constructor() {
    super();

    let globalNotification;
    try {
      globalNotification = JSON.parse(document.getElementById('admin-global-notification-setting').getAttribute('data-global-notification'));
    }
    catch (err) {
      toastError(err);
      logger.error(err);
    }

    this.state = {
      globalNotificationId: globalNotification._id || null,
      triggerPath: globalNotification.triggerPath || '',
      notifyToType: globalNotification.__t || 'mail',
      emailToSend: globalNotification.toEmail || '',
      slackChannelToSend: globalNotification.slackChannels || '',
      triggerEvents: new Set(globalNotification.triggerEvents),
    };

    this.submitHandler = this.submitHandler.bind(this);
  }

  onChangeTriggerPath(inputValue) {
    this.setState({ triggerPath: inputValue });
  }

  onChangeNotifyToType(notifyToType) {
    this.setState({ notifyToType });
  }

  onChangeEmailToSend(inputValue) {
    this.setState({ emailToSend: inputValue });
  }

  onChangeSlackChannelToSend(inputValue) {
    this.setState({ slackChannelToSend: inputValue });
  }

  onChangeTriggerEvents(triggerEvent) {
    const { triggerEvents } = this.state;

    if (triggerEvents.has(triggerEvent)) {
      triggerEvents.delete(triggerEvent);
      this.setState({ triggerEvents });
    }
    else {
      triggerEvents.add(triggerEvent);
      this.setState({ triggerEvents });
    }
  }

  async submitHandler() {

    const requestParams = {
      triggerPath: this.state.triggerPath,
      notifyToType: this.state.notifyToType,
      toEmail: this.state.emailToSend,
      slackChannels: this.state.slackChannelToSend,
      triggerEvents: [...this.state.triggerEvents],
    };

    try {
      if (this.state.globalNotificationId != null) {
        await apiv3Put(`/notification-setting/global-notification/${this.state.globalNotificationId}`, requestParams);
      }
      else {
        await apiv3Post('/notification-setting/global-notification', requestParams);
      }
      window.location.href = urljoin(window.location.origin, '/admin/notification#global-notification');
    }
    catch (err) {
      toastError(err);
      logger.error(err);
    }
  }


  render() {
    const { t } = this.props;
    // TODO GW-5729 enable useIsMailerSetup
    // const { data: isMailerSetup } = useIsMailerSetup();
    const isMailerSetup = false;
    return (
      <React.Fragment>

        <div className="my-3">
          <a href="/admin/notification#global-notification" className="btn btn-outline-secondary">
            <i className="icon-fw ti-arrow-left" aria-hidden="true"></i>
            {t('notification_setting.back_to_list')}
          </a>
        </div>


        <div className="row">
          <div className="form-box col-md-12">
            <h2 className="border-bottom mb-5">{t('notification_setting.notification_detail')}</h2>
          </div>

          <div className="col-sm-4">
            <h3 htmlFor="triggerPath">{t('notification_setting.trigger_path')}
              {/* eslint-disable-next-line react/no-danger */}
              <small dangerouslySetInnerHTML={{ __html: t('notification_setting.trigger_path_help', '<code>*</code>') }} />
            </h3>
            <div className="form-group">
              <input
                className="form-control"
                type="text"
                name="triggerPath"
                value={this.state.triggerPath}
                onChange={(e) => { this.onChangeTriggerPath(e.target.value) }}
                required
              />
            </div>

            <h3>{t('notification_setting.notify_to')}</h3>
            <div className="form-group form-inline">
              <div className="custom-control custom-radio">
                <input
                  className="custom-control-input"
                  type="radio"
                  id="mail"
                  name="notifyToType"
                  value="mail"
                  checked={this.state.notifyToType === 'mail'}
                  onChange={() => { this.onChangeNotifyToType('mail') }}
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
                  name="notifyToType"
                  value="slack"
                  checked={this.state.notifyToType === 'slack'}
                  onChange={() => { this.onChangeNotifyToType('slack') }}
                />
                <label className="custom-control-label" htmlFor="slack">
                  <p className="font-weight-bold">Slack</p>
                </label>
              </div>
            </div>

            {this.state.notifyToType === 'mail'
              ? (
                <>
                  <div className="input-group notify-to-option" id="mail-input">
                    <div className="input-group-prepend">
                      <span className="input-group-text" id="mail-addon"><i className="ti-email" /></span>
                    </div>
                    <input
                      className="form-control"
                      type="text"
                      aria-describedby="mail-addon"
                      name="toEmail"
                      placeholder="Email"
                      value={this.state.emailToSend}
                      onChange={(e) => { this.onChangeEmailToSend(e.target.value) }}
                    />

                  </div>

                  <p className="p-2">
                    {/* eslint-disable-next-line react/no-danger */}
                    {!isMailerSetup && <span className="form-text text-muted" dangerouslySetInnerHTML={{ __html: t('admin:mailer_setup_required') }} />}
                    <b>Hint: </b>
                    <a href="https://ifttt.com/create" target="blank">{t('notification_setting.email.ifttt_link')}
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
                      value={this.state.slackChannelToSend}
                      onChange={(e) => { this.onChangeSlackChannelToSend(e.target.value) }}
                    />
                  </div>
                  <p className="p-2">
                    {/* eslint-disable-next-line react/no-danger */}
                    <span dangerouslySetInnerHTML={{ __html: t('notification_setting.channel_desc') }} />
                  </p>
                </>
              )}
          </div>

          <div className="offset-1 col-sm-5">
            <div className="form-group">
              <h3>{t('notification_setting.trigger_events')}</h3>
              <div className="my-1">
                <TriggerEventCheckBox
                  checkbox="success"
                  event="pageCreate"
                  checked={this.state.triggerEvents.has('pageCreate')}
                  onChange={() => this.onChangeTriggerEvents('pageCreate')}
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
                  checked={this.state.triggerEvents.has('pageEdit')}
                  onChange={() => this.onChangeTriggerEvents('pageEdit')}
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
                  checked={this.state.triggerEvents.has('pageMove')}
                  onChange={() => this.onChangeTriggerEvents('pageMove')}
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
                  checked={this.state.triggerEvents.has('pageDelete')}
                  onChange={() => this.onChangeTriggerEvents('pageDelete')}
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
                  checked={this.state.triggerEvents.has('pageLike')}
                  onChange={() => this.onChangeTriggerEvents('pageLike')}
                >
                  <span className="badge badge-pill badge-info">
                    <i className="icon-like mr-1" />LIKE
                  </span>
                </TriggerEventCheckBox>
              </div>
              <div className="my-1">
                <TriggerEventCheckBox
                  checkbox="secondary"
                  event="comment"
                  checked={this.state.triggerEvents.has('comment')}
                  onChange={() => this.onChangeTriggerEvents('comment')}
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
          onClick={this.submitHandler}
          disabled={this.state.retrieveError != null}
        />

      </React.Fragment>

    );
  }

}

ManageGlobalNotification.propTypes = {
  t: PropTypes.func.isRequired, // i18next
};

export default withTranslation()(ManageGlobalNotification);
