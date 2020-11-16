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
    t, pageAccessoriesContainer, isGuestUser, isSharedUser,
  } = props;

  const accessoriesBtnList = useMemo(() => {
    return [
      {
        name: 'pagelist',
        Icon: <PageListIcon />,
        disabled: isSharedUser,
      },
      {
        name: 'timeline',
        Icon: <TimeLineIcon />,
        disabled: isSharedUser,
      },
      {
        name: 'pageHistory',
        Icon: <HistoryIcon />,
        disabled: isGuestUser || isSharedUser,
      },
      {
        name: 'attachment',
        Icon: <AttachmentIcon />,
        disabled: false,
      },
      {
        name: 'shareLink',
        Icon: <ShareLinkIcon />,
        disabled: isGuestUser || isSharedUser,
      },
    ];
  }, [isGuestUser, isSharedUser]);

  return (
    <div className="grw-page-accessories-control d-flex align-items-center justify-content-between pb-1">
      {accessoriesBtnList.map((accessory) => {
        return (
          <Fragment key={accessory.name}>
            <div id={`shareLink-btn-wrapper-for-tooltip-for-${accessory.name}`}>
              <button
                type="button"
                className={`btn btn-link grw-btn-page-accessories ${accessory.disabled && 'disabled'}`}
                onClick={() => pageAccessoriesContainer.openPageAccessoriesModal(accessory.name)}
              >
                {accessory.Icon}
              </button>
            </div>
            {accessory.disabled && (
              <UncontrolledTooltip placement="top" target={`shareLink-btn-wrapper-for-tooltip-for-${accessory.name}`} fade={false}>
                {t('Not available for guest')}
              </UncontrolledTooltip>
            )}
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
};

export default withTranslation()(PageAccessoriesModalControlWrapper);
