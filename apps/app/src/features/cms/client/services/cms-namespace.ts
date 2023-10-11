import { apiv3Post } from '~/client/util/apiv3-client';

import { ICmsNamespace } from '../../interfaces';

export const create = async(namespace: string, desc?: string): Promise<void> => {
  const newNamespace: ICmsNamespace = {
    namespace,
    desc,
  };
  await apiv3Post('/cms/namespace', { data: newNamespace });
};
