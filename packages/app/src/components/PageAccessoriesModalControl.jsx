import React, { Fragment, useMemo } from 'react';

import PropTypes from 'prop-types';
import { useTranslation } from 'next-i18next';
import { UncontrolledTooltip } from 'reactstrap';

import { useCurrentPageId } from '~/stores/context';

import AttachmentIcon from './Icons/AttachmentIcon';
import HistoryIcon from './Icons/HistoryIcon';
import PageListIcon from './Icons/PageListIcon';
import ShareLinkIcon from './Icons/ShareLinkIcon';
import TimeLineIcon from './Icons/TimeLineIcon';
import { withUnstatedContainers } from './UnstatedUtils';


const PageAccessoriesModalControl = (props) => {
  const { t } = useTranslation();
  const {
    pageAccessoriesContainer, isGuestUser, isSharedUser,
  } = props;
  const isLinkSharingDisabled = pageAccessoriesContainer.appContainer.config.disableLinkSharing;

  const { data: pageId } = useCurrentPageId();

  const accessoriesBtnList = useMemo(() => {
    return [
      {
        name: 'pagelist',
        Icon: <PageListIcon />,
        disabled: isSharedUser,
        i18n: t('page_list'),
      },
      {
        name: 'timeline',
        Icon: <TimeLineIcon />,
        disabled: isSharedUser,
        i18n: t('Timeline View'),
      },
      {
        name: 'pageHistory',
        Icon: <HistoryIcon />,
        disabled: isGuestUser || isSharedUser,
        i18n: t('History'),
      },
      {
        name: 'attachment',
        Icon: <AttachmentIcon />,
        i18n: t('attachment_data'),
      },
      {
        name: 'shareLink',
        Icon: <ShareLinkIcon />,
        disabled: isGuestUser || isSharedUser || isLinkSharingDisabled,
        i18n: t('share_links.share_link_management'),
      },
    ];
  }, [t, isGuestUser, isSharedUser, isLinkSharingDisabled]);

  return (
    <div className="grw-page-accessories-control d-flex flex-nowrap align-items-center justify-content-end justify-content-lg-between">
      {accessoriesBtnList.map((accessory) => {

        let tooltipMessage;
        if (accessory.disabled) {
          tooltipMessage = t('Not available for guest');
          if (accessory.name === 'shareLink' && isLinkSharingDisabled) {
            tooltipMessage = t('Link sharing is disabled');
          }
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
                onClick={() => pageAccessoriesContainer.openPageAccessoriesModal(accessory.name)}
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
    </div>
  );
};

PageAccessoriesModalControl.propTypes = {
  pageAccessoriesContainer: PropTypes.any,

  isGuestUser: PropTypes.bool.isRequired,
  isSharedUser: PropTypes.bool.isRequired,
};

/**
 * Wrapper component for using unstated
 */
const PageAccessoriesModalControlWrapper = withUnstatedContainers(PageAccessoriesModalControl, []);

export default PageAccessoriesModalControlWrapper;
