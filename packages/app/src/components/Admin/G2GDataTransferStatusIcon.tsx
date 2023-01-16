import React, { type ComponentPropsWithoutRef } from 'react';

import { G2G_PROGRESS_STATUS, type G2GProgressStatus } from '~/interfaces/g2g-transfer';

/**
 * Props for {@link G2GDataTransferStatusIcon}
 */
interface Props extends ComponentPropsWithoutRef<'i'>{
  status: G2GProgressStatus;
}

/**
 * Icon for G2G transfer status
 */
const G2GDataTransferStatusIcon = ({ status, className, ...props }: Props): JSX.Element => {
  if (status === G2G_PROGRESS_STATUS.IN_PROGRESS) {
    return (
      <i className={`fa fa-spinner fa-pulse fa-fw ${className}`} aria-label="in progress" {...props} />
    );
  }

  if (status === G2G_PROGRESS_STATUS.COMPLETED) {
    return (
      <i className={`fa fa-check-circle-o fa-fw text-info ${className}`} aria-label="completed" {...props} />
    );
  }

  if (status === G2G_PROGRESS_STATUS.ERROR) {
    return (
      <i className={`fa fa-exclamation-circle fa-fw text-danger ${className}`} aria-label="error" {...props} />
    );
  }

  if (status === G2G_PROGRESS_STATUS.SKIPPED) {
    return (
      <i className={`fa fa-ban fa-fw ${className}`} aria-label="skipped" {...props} />
    );
  }

  return <i className={`fa fa-circle-o fa-fw ${className}`} aria-label="pending" {...props} />;
};

export default G2GDataTransferStatusIcon;
