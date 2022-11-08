import React, { type ComponentPropsWithoutRef } from 'react';

/**
 * Get the union type of all the values in an object, array or array-like type `T`
 * @see {@link https://github.com/piotrwitek/utility-types/blob/df2502ef504c4ba8bd9de81a45baef112b7921d0/src/mapped-types.ts#L589-L597}
 */
type ValuesType<
 T extends ReadonlyArray<any> | ArrayLike<any> | Record<any, any>
> = T extends ReadonlyArray<any>
 ? T[number]
 : T extends ArrayLike<any>
 ? T[number]
 : T extends object
 ? T[keyof T]
 : never;

/**
 * G2G transfer progress status master
 */
const G2G_PROGRESS_STATUS = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  ERROR: 'ERROR',
} as const;

/**
 * G2G transfer progress status
 */
type G2GProgressStatus = ValuesType<typeof G2G_PROGRESS_STATUS>

/**
 * Props for {@link G2GDataTransfer}
 */
interface Props extends ComponentPropsWithoutRef<'i'>{
  status: G2GProgressStatus;
}

/**
 * Icon for G2G transfer status
 */
const G2GDataTransferStatusIcon = ({ status, className, ...props }: Props): JSX.Element | null => {
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

  return <i className={`fa fa-circle-o fa-fw ${className}`} aria-label="pending" {...props} />;
};

export default G2GDataTransferStatusIcon;
