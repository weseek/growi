import React from 'react';

import dynamic from 'next/dynamic';

import { useIsEmpty } from '~/stores/context';

import { FixPageGrantAlert } from './FixPageGrantAlert';
import { OldRevisionAlert } from './OldRevisionAlert';
import { PageGrantAlert } from './PageGrantAlert';
import { PageStaleAlert } from './PageStaleAlert';

// dynamic import because TrashPageAlert uses localStorageMiddleware
const TrashPageAlert = dynamic(() => import('./TrashPageAlert').then(mod => mod.TrashPageAlert), { ssr: false });

export const PageAlerts = (): JSX.Element => {

  const { data: isEmpty } = useIsEmpty();

  return (
    <div className="row d-edit-none">
      <div className="col-sm-12">
        {/* alerts */}
        { !isEmpty && <FixPageGrantAlert /> }
        <PageGrantAlert />
        <TrashPageAlert />
        <PageStaleAlert />
        <OldRevisionAlert />
      </div>
    </div>
  );
};
