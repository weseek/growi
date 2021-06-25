import React, { Fragment, useMemo } from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

import { UncontrolledTooltip } from 'reactstrap';
import PageAccessoriesContainer from '../services/PageAccessoriesContainer';

import PageListIcon from './Icons/PageListIcon';
import TimeLineIcon from './Icons/TimeLineIcon';
import HistoryIcon from './Icons/HistoryIcon';
import AttachmentIcon from './Icons/AttachmentIcon';
import ShareLinkIcon from './Icons/ShareLinkIcon';
import SeenUserInfo from './User/SeenUserInfo';

import { withUnstatedContainers } from './UnstatedUtils';

const PageAccessoriesModalControl = (props) => {
  const {
    t, pageAccessoriesContainer, isGuestUser, isSharedUser, isNotFoundPage,
  } = props;
  const isLinkSharingDisabled = pageAccessoriesContainer.appContainer.config.disableLinkSharing;

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
        disabled: isGuestUser || isSharedUser || isNotFoundPage,
        i18n: t('History'),
      },
      {
        name: 'attachment',
        Icon: <AttachmentIcon />,
        disabled: isNotFoundPage,
        i18n: t('attachment_data'),
      },
      {
        name: 'shareLink',
        Icon: <ShareLinkIcon />,
        disabled: isGuestUser || isSharedUser || isNotFoundPage || isLinkSharingDisabled,
        i18n: t('share_links.share_link_management'),
      },
    ];
  }, [t, isGuestUser, isSharedUser, isNotFoundPage, isLinkSharingDisabled]);

  return (
    <div className="grw-page-accessories-control d-flex flex-nowrap align-items-center justify-content-end justify-content-lg-between">
      {accessoriesBtnList.map((accessory) => {

        let tooltipMessage;
        if (accessory.disabled) {
          tooltipMessage = isNotFoundPage ? t('not_found_page.page_not_exist') : t('Not available for guest');
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
      <div className="d-flex align-items-center">
        <span className="border-left grw-border-vr">&nbsp;</span>
        <SeenUserInfo disabled={isSharedUser} />
      </div>
    </div>
  );
};
/**
 * Wrapper component for using unstated
 */
const PageAccessoriesModalControlWrapper = withUnstatedContainers(PageAccessoriesModalControl, [PageAccessoriesContainer]);

PageAccessoriesModalControl.propTypes = {
  t: PropTypes.func.isRequired, //  i18next

  pageAccessoriesContainer: PropTypes.instanceOf(PageAccessoriesContainer).isRequired,

  isGuestUser: PropTypes.bool.isRequired,
  isSharedUser: PropTypes.bool.isRequired,
  isNotFoundPage: PropTypes.bool.isRequired,
};

export default withTranslation()(PageAccessoriesModalControlWrapper);
