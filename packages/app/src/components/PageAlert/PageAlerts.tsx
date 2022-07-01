import React from 'react';

import { FixPageGrantAlert } from './FixPageGrantAlert';
import { OldRevisionAlert } from './OldRevisionAlert';
import { PageGrantAlert } from './PageGrantAlert';
import { PageStaleAlert } from './PageStaleAlert';
import dynamic from 'next/dynamic';

// dynamic import because TrashPageAlert uses localStorageMiddleware
const TrashPageAlert = dynamic(() => import('./TrashPageAlert').then(mod => mod.TrashPageAlert), { ssr: false });

export const PageAlerts = (): JSX.Element => {


  return (
    <div className="row d-edit-none">
      <div className="col-sm-12">
        {/* alerts */}
        <FixPageGrantAlert />
        <PageGrantAlert />
        <PageStaleAlert />
        <OldRevisionAlert />
        <TrashPageAlert />
      </div>
    </div>
  );
};
