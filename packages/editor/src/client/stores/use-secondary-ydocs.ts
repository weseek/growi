import { useEffect } from 'react';

import useSWRImmutable from 'swr/immutable';
import * as Y from 'yjs';

type Configuration = {
  pageId?: string;
  useSecondary?: boolean;
}


type StoredYDocs = {
  primaryDoc: Y.Doc;
  secondaryDoc: Y.Doc | undefined;
}

type YDocsState = StoredYDocs & {
  activeDoc: Y.Doc,
}

const docsCache = new Map<string, StoredYDocs>();

export const useSecondaryYdocs = (isEnabled: boolean, configuration?: Configuration): YDocsState | null => {
  const { pageId, useSecondary = false } = configuration ?? {};

  const cacheKey = `ydocs:${pageId}`;

  const { data: docs, mutate } = useSWRImmutable<StoredYDocs>(
    isEnabled && pageId ? cacheKey : null,
    () => {
      // Return cached docs if they exist
      const cached = docsCache.get(cacheKey);
      if (cached) {
        return cached;
      }

      // Create new docs
      const primaryDoc = new Y.Doc();
      const storedYdocs: StoredYDocs = { primaryDoc, secondaryDoc: undefined };
      docsCache.set(cacheKey, storedYdocs);
      return storedYdocs;
    },
  );

  // Setup or cleanup secondaryDoc based on useSecondary flag
  useEffect(() => {
    if (!docs) return;

    // Create secondaryDoc
    if (useSecondary && docs.secondaryDoc == null) {
      const secondaryDoc = new Y.Doc();
      docsCache.set(cacheKey, { ...docs, secondaryDoc });
      mutate({ ...docs, secondaryDoc }, false);

      // initialize secondaryDoc with primaryDoc state
      Y.applyUpdate(secondaryDoc, Y.encodeStateAsUpdate(docs.primaryDoc));
    }
    // Cleanup secondaryDoc
    else if (!useSecondary && docs.secondaryDoc != null) {
      docs.secondaryDoc.destroy();
      docsCache.set(cacheKey, { ...docs, secondaryDoc: undefined });
      mutate({ ...docs, secondaryDoc: undefined }, false);
    }

    // Cleanup on unmount or when isEnabled becomes false
    return () => {
      if (!isEnabled && docsCache.has(cacheKey)) {
        const state = docsCache.get(cacheKey);
        state?.primaryDoc.destroy();
        state?.secondaryDoc?.destroy();
        docsCache.delete(cacheKey);
      }
    };
  }, [cacheKey, docs, isEnabled, useSecondary, mutate]);

  if (!docs?.primaryDoc || (useSecondary && !docs?.secondaryDoc)) {
    return null;
  }

  return {
    activeDoc: docs.secondaryDoc ?? docs.primaryDoc,
    primaryDoc: docs.primaryDoc,
    secondaryDoc: docs.secondaryDoc,
  };
};
