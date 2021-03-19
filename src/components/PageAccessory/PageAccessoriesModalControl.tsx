import {
  FC, Fragment, useMemo, useCallback,
} from 'react';
import { UncontrolledTooltip } from 'reactstrap';
import { useTranslation } from '~/i18n';

import PageListIcon from '../../client/js/components/Icons/PageListIcon';
import TimeLineIcon from '../../client/js/components/Icons/TimeLineIcon';
import HistoryIcon from '../../client/js/components/Icons/HistoryIcon';
import AttachmentIcon from '../../client/js/components/Icons/AttachmentIcon';
import ShareLinkIcon from '../../client/js/components/Icons/ShareLinkIcon';
import { SeenUserInfo } from '~/components/User/SeenUserInfo';

import { AccessoryName } from '~/interfaces/accessory';

type Props = {
  isGuestUser: boolean;
  isSharedUser: boolean;
  isNotFoundPage: boolean;
  onOpen?: (string)=>void;
}
type AccessoriesBtnListType = { name: string; Icon: JSX.Element; disabled: boolean; i18n: string; }


export const PageAccessoriesModalControl:FC<Props> = (props:Props) => {
  const {
    isGuestUser, isSharedUser, isNotFoundPage, onOpen,
  } = props;
  const { t } = useTranslation();

  const openModalHandler = useCallback((accessoryName:string):void => {
    if (onOpen == null) {
      return;
    }
    onOpen(accessoryName);
  }, [onOpen]);

  const accessoriesBtnList:AccessoriesBtnListType[] = useMemo(() => {
    return [
      {
        name: AccessoryName.PAGE_LIST,
        Icon: <PageListIcon />,
        disabled: isSharedUser,
        i18n: t('page_list'),
      },
      {
        name: AccessoryName.TIME_LINE,
        Icon: <TimeLineIcon />,
        disabled: isSharedUser,
        i18n: t('Timeline View'),
      },
      {
        name: AccessoryName.PAGE_HISTORY,
        Icon: <HistoryIcon />,
        disabled: isGuestUser || isSharedUser || isNotFoundPage,
        i18n: t('History'),
      },
      {
        name: AccessoryName.ATTACHMENT,
        Icon: <AttachmentIcon />,
        disabled: isNotFoundPage,
        i18n: t('attachment_data'),
      },
      {
        name: AccessoryName.SHARE_LINK,
        Icon: <ShareLinkIcon />,
        disabled: isGuestUser || isSharedUser || isNotFoundPage,
        i18n: t('share_links.share_link_management'),
      },
    ];
  }, [t, isGuestUser, isSharedUser, isNotFoundPage]);

  return (
    <div className="grw-page-accessories-control d-flex flex-nowrap align-items-center justify-content-end justify-content-lg-between">
      {accessoriesBtnList.map((accessory) => {

        let tooltipMessage;
        if (accessory.disabled) {
          tooltipMessage = isNotFoundPage ? t('not_found_page.page_not_exist') : t('Not available for guest');
        }
        else {
          tooltipMessage = accessory.i18n;
        }
        return (
          <Fragment key={accessory.name}>
            <div id={`shareLink-btn-wrapper-for-tooltip-for-${accessory.name}`}>
              <button
                type="button"
                className={`btn btn-link grw-btn-page-accessories ${accessory.disabled ? 'disabled' : ''}`}
                onClick={() => openModalHandler(accessory.name)}
              >
                {accessory.Icon}
              </button>
            </div>
            <UncontrolledTooltip placement="top" target={`shareLink-btn-wrapper-for-tooltip-for-${accessory.name}`} fade={false}>
              {tooltipMessage}
            </UncontrolledTooltip>
          </Fragment>
        );
      })}

      <div className="d-flex align-items-center">
        <span className="border-left grw-border-vr">&nbsp;</span>
        <SeenUserInfo disabled={isSharedUser} />
      </div>
    </div>
  );
};
