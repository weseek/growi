import React, { FC } from 'react';

import { useTranslation } from 'react-i18next';
import { DropdownItem } from 'reactstrap';
import { IInAppNotification, PaginateResult } from '~/interfaces/in-app-notification';
import { HasObjectId } from '~/interfaces/has-object-id';
import InAppNotificationElm from './InAppNotificationElm';


type Props = {
  inAppNotificationData?: PaginateResult<IInAppNotification>,
  elemClassName?: string,
  tag?: 'div' | 'DropdownItem',
};

const InAppNotificationList: FC<Props> = (props: Props) => {
  const { t } = useTranslation();
  const { inAppNotificationData } = props;

  if (inAppNotificationData == null) {
    return (
      <div className="wiki">
        <div className="text-muted text-center">
          <i className="fa fa-2x fa-spinner fa-pulse mr-1"></i>
        </div>
      </div>
    );
  }

  const notifications = inAppNotificationData.docs;

  const isDropdownItem = props.tag === 'DropdownItem';

  // determine tag
  const TagElem = isDropdownItem
    ? DropdownItem
  // eslint-disable-next-line react/prop-types
    : props => <div {...props}>{props.children}</div>;

  if (notifications.length === 0) {
    return (
      <TagElem
        disabled={isDropdownItem ? true : undefined}
        className={props.elemClassName}
      >{t('in_app_notification.no_notification')}
      </TagElem>
    );
  }

  return (
    <>
      { notifications.map((notification: IInAppNotification & HasObjectId) => {
        return (
          <TagElem className={props.elemClassName} key={notification._id}>
            <InAppNotificationElm notification={notification} />
          </TagElem>
        );
      }) }
    </>
  );
};


export default InAppNotificationList;
