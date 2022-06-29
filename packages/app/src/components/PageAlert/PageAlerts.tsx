import React from 'react';

import dynamic from 'next/dynamic';

import { FixPageGrantAlert } from './FixPageGrantAlert';
import { PageGrantAlert } from './PageGrantAlert';
import { PageStaleAlert } from './PageStaleAlert';

const TrashPageAlert = dynamic(() => import('./TrashPageAlert').then(mod => mod.TrashPageAlert), { ssr: false });

export const PageAlerts = (): JSX.Element => {


  return (
    <div className="row d-edit-none">
      <div className="col-sm-12">
        {/* alerts */}
        <FixPageGrantAlert />
        <PageGrantAlert />
        <TrashPageAlert />
        <PageStaleAlert />
      </div>
    </div>
  );
};
