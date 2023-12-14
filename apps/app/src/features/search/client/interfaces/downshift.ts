import type { ControllerStateAndHelpers } from 'downshift';

type DownshiftItem = { url: string };

export type GetItemProps = ControllerStateAndHelpers<DownshiftItem>['getItemProps']
export type GetInputProps = ControllerStateAndHelpers<DownshiftItem>['getInputProps']
