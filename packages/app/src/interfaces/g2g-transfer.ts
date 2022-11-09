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
export const G2G_PROGRESS_STATUS = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  ERROR: 'ERROR',
} as const;

/**
* G2G transfer progress status
*/
export type G2GProgressStatus = ValuesType<typeof G2G_PROGRESS_STATUS>

/**
* G2G transfer progress
*/
export interface G2GProgress {
 mongo: G2GProgressStatus;
 attachments: G2GProgressStatus;
}
