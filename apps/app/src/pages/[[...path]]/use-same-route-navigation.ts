import { useEffect } from 'react';

import { useRouter } from 'next/router';

import { useCurrentPageData, useFetchCurrentPage } from '~/states/page';
import { useEditingMarkdown } from '~/stores/editor';

export const useSameRouteNavigation = (): void => {
  const router = useRouter();
  const [currentPage] = useCurrentPageData();
  const { fetchCurrentPage } = useFetchCurrentPage();
  const { mutate: mutateEditingMarkdown } = useEditingMarkdown();

  // useEffect to trigger data fetching when the path changes
  useEffect(() => {
    const targetPath = router.asPath;
    const currentPagePath = currentPage?.path;

    // Do nothing if the target path is the same as the currently loaded page's path
    if (targetPath === currentPagePath) {
      return;
    }

    const fetch = async() => {
      const pageData = await fetchCurrentPage({ path: targetPath });
      if (pageData?.revision?.body != null) {
        mutateEditingMarkdown(pageData.revision.body);
      }
    };
    fetch();
  }, [router.asPath, currentPage?.path, fetchCurrentPage, mutateEditingMarkdown]);
};
