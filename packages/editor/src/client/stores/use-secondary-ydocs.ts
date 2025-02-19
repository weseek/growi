import { useEffect, useState } from 'react';

import * as Y from 'yjs';

type UseDocumentStateProps = {
  isEnabled: boolean;
  pageId?: string;
  useSecondary?: boolean;
}

type DocumentState = {
  activeDoc: Y.Doc,
  primaryDoc: Y.Doc,
  secondaryDoc?: Y.Doc,
}

export const useSecondaryYdocs = ({ isEnabled, pageId, useSecondary }: UseDocumentStateProps): DocumentState | null => {

  const [currentPageId, setCurrentPageId] = useState(pageId);

  // docs: [primaryDoc, secondaryDoc]
  const [docs, setDocs] = useState<[Y.Doc, Y.Doc]>();

  // Setup doc
  useEffect(() => {

    let _primaryDoc: Y.Doc;
    let _secondaryDoc: Y.Doc;

    setDocs((prevDocs) => {
      // keep the current docs if the conditions are met
      if (isEnabled
          // the given page ID is not null
          && pageId != null
          // the current page ID matches the given page ID,
          && currentPageId === pageId
          // the main document is already initialized
          && prevDocs?.[0] != null
          // the review mode status matches the presence of the review document
          && useSecondary === (prevDocs?.[1] != null)) {

        return prevDocs;
      }

      setCurrentPageId(pageId);

      // set undefined
      if (!isEnabled) {
        return undefined;
      }

      _primaryDoc = prevDocs?.[0] ?? new Y.Doc();

      if (useSecondary) {
        _secondaryDoc = prevDocs?.[1] ?? new Y.Doc();

        const text = _primaryDoc.getText('codemirror');

        // initialize secondaryDoc with primaryDoc state
        Y.applyUpdate(_secondaryDoc, Y.encodeStateAsUpdate(_primaryDoc));
        // Setup sync from primaryDoc to secondaryDoc
        text.observe((event) => {
          if (event.transaction.local) return;
          Y.applyUpdate(_secondaryDoc, Y.encodeStateAsUpdate(_primaryDoc));
        });
      }

      return [_primaryDoc, _secondaryDoc];
    });

    // cleanup
    return () => {
      _primaryDoc?.destroy();
      _secondaryDoc?.destroy();
    };

  }, [isEnabled, currentPageId, pageId, useSecondary]);

  // Handle secondaryDoc to primaryDoc sync when exiting review mode
  // useEffect(() => {
  //   if (!isEnabled || reviewMode || !secondaryDoc || !primaryDoc) {
  //     return;
  //   }

  //   Y.applyUpdate(primaryDoc, Y.encodeStateAsUpdate(secondaryDoc));
  //   secondaryDoc.destroy();
  //   setsecondaryDoc(null);
  // }, [isEnabled, reviewMode, secondaryDoc, primaryDoc]);

  const [primaryDoc, secondaryDoc] = docs ?? [undefined, undefined];

  if (primaryDoc == null || (useSecondary && secondaryDoc == null)) {
    return null;
  }

  return {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    activeDoc: useSecondary ? secondaryDoc! : primaryDoc,
    primaryDoc,
    secondaryDoc,
  };
};
