import type { IUser } from '@growi/core';

export type PreNotifyProps = {
  notificationTargetUsers?: IUser[],
}

export type PreNotify = (props: PreNotifyProps) => Promise<void>;
