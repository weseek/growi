import { useCallback, useState } from 'react';

import { useRouter } from 'next/router';

import { createPage, exist } from '~/client/services/page-operation';
import { toastError } from '~/client/util/toastr';
import { EditorMode, useEditorMode } from '~/stores/ui';

export const useOnNewButtonClicked = (
    currentPagePath?: string,
    isLoading?: boolean,
): {
  onClickHandler: () => Promise<void>,
  isPageCreating: boolean
} => {
  const router = useRouter();
  const [isPageCreating, setIsPageCreating] = useState(false);

  const { mutate: mutateEditorMode } = useEditorMode();

  const onClickHandler = useCallback(async() => {
    if (isLoading) return;

    try {
      setIsPageCreating(true);

      const response = await createPage({
        parentPath: currentPagePath,
        optionalParentPath: '/',
      });

      await router.push(`/${response.page._id}#edit`);
      mutateEditorMode(EditorMode.Editor);
    }
    catch (err) {
      toastError(err);
    }
    finally {
      setIsPageCreating(false);
    }
  }, [currentPagePath, isLoading, mutateEditorMode, router]);

  return { onClickHandler, isPageCreating };
};

export const useOnTodaysButtonClicked = (
    todaysPath: string | null,
): {
  onClickHandler: () => Promise<void>,
  isPageCreating: boolean
} => {
  const router = useRouter();
  const [isPageCreating, setIsPageCreating] = useState(false);

  const { mutate: mutateEditorMode } = useEditorMode();

  const onClickHandler = useCallback(async() => {
    if (todaysPath == null) {
      return;
    }

    try {
      setIsPageCreating(true);

      const res = await exist(JSON.stringify([todaysPath]));
      if (!res.pages[todaysPath]) {
        await createPage({ path: todaysPath });
      }

      await router.push(`${todaysPath}#edit`);
      mutateEditorMode(EditorMode.Editor);
    }
    catch (err) {
      toastError(err);
    }
    finally {
      setIsPageCreating(false);
    }
  }, [mutateEditorMode, router, todaysPath]);

  return { onClickHandler, isPageCreating };
};
