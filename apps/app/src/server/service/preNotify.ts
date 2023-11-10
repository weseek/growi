import type { IUser } from '@growi/core';

type PreNotifyProps = {
  notificationTargetUsers?: IUser[],
}

export type PreNotify = (props: PreNotifyProps) => Promise<void>;
