import { useCallback, useState } from 'react';

import { isCreatablePage } from '@growi/core/dist/utils/page-path-utils';
import { useRouter } from 'next/router';

import { createPage, exist } from '~/client/services/page-operation';
import type { LabelType } from '~/interfaces/template';
import { EditorMode, useEditorMode } from '~/stores/ui';

export const useCreateTemplatePage = (
    currentPagePath?: string,
    isLoading?: boolean,
): {
  isCreatable: boolean,
  isPageCreating: boolean,
  create?: (label: LabelType) => Promise<void>,
} => {
  const router = useRouter();

  const { mutate: mutateEditorMode } = useEditorMode();

  const [isPageCreating, setIsPageCreating] = useState(false);

  const isCreatable = currentPagePath != null && isCreatablePage(`${currentPagePath}/_template`);

  const create = useCallback(async(label: LabelType) => {
    if (isLoading || !isCreatable) return;

    try {
      setIsPageCreating(true);

      const templatePagePath = `${currentPagePath}/${label}`;
      const res = await exist(JSON.stringify([templatePagePath]));
      const isExists = res.pages[templatePagePath];

      if (!isExists) {
        await createPage({ path: templatePagePath });
      }

      router.push(`${templatePagePath}#edit`);
      mutateEditorMode(EditorMode.Editor);
    }
    catch (err) {
      throw err;
    }
    finally {
      setIsPageCreating(false);
    }
  }, [currentPagePath, isCreatable, isLoading, mutateEditorMode, router]);

  return {
    isCreatable,
    isPageCreating,
    create: isCreatable ? create : undefined,
  };
};
