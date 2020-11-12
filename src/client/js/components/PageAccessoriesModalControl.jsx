import React, { useMemo } from 'react';
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
    t, pageAccessoriesContainer, isGuestUserMode, isSharedUserMode,
  } = props;

  const accessoriesBtnList = useMemo(() => {
    return [
      {
        name: 'pagelist',
        Icon: <PageListIcon />,
        disabled: isSharedUserMode,
      },
      {
        name: 'timeline',
        Icon: <TimeLineIcon />,
        disabled: isSharedUserMode,
      },
      {
        name: 'pageHistory',
        Icon: <HistoryIcon />,
        disabled: isSharedUserMode,
      },
      {
        name: 'attachment',
        Icon: <AttachmentIcon />,
        disabled: false,
      },
      {
        name: 'shareLink',
        Icon: <ShareLinkIcon />,
        disabled: isGuestUserMode || isSharedUserMode,
      },
    ];
  }, [isGuestUserMode, isSharedUserMode]);

  return (
    <div className="grw-page-accessories-control d-flex align-items-center justify-content-between pb-1">
      {accessoriesBtnList.map((accessory) => {
        return (
          <>
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
          </>
        );
      })}
      <div className="d-flex align-items-center">
        <span className="border-left grw-border-vr">&nbsp;</span>
        <SeenUserInfo disabled={isSharedUserMode} />
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

  isGuestUserMode: PropTypes.bool.isRequired,
  isSharedUserMode: PropTypes.bool.isRequired,
};

export default withTranslation()(PageAccessoriesModalControlWrapper);
