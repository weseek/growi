import React, { Suspense } from 'react';

import dynamic from 'next/dynamic';
import { useTranslation } from 'react-i18next';

import ItemsTreeContentSkeleton from '~/client/components/ItemsTree/ItemsTreeContentSkeleton';

const KnowledgeAssistantContent = dynamic(() => import('./KnowledgeAssistantSubstance').then(mod => mod.KnowledgeAssistantContent), { ssr: false });

export const KnowledgeAssistant = (): JSX.Element => {
  const { t } = useTranslation();

  return (
    <div className="px-3">
      <div className="grw-sidebar-content-header py-4 d-flex">
        <h3 className="fs-6 fw-bold mb-0">
          {t('Knowledge Assistant')}
        </h3>
      </div>
      <Suspense fallback={<ItemsTreeContentSkeleton />}>
        <KnowledgeAssistantContent />
      </Suspense>
    </div>
  );
};
