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

  const [primaryDoc, setPrimaryDoc] = useState<Y.Doc>();
  const [secondaryDoc, setSecondaryDoc] = useState<Y.Doc>();

  // Setup primaryDoc
  useEffect(() => {

    let _primaryDoc: Y.Doc;

    setPrimaryDoc((prevPrimaryDoc) => {
      // keep the current ydoc if the conditions are met
      if (isEnabled
          // the given page ID is not null
          && pageId != null
          // the current page ID matches the given page ID,
          && currentPageId === pageId
          // the main document is already initialized
          && prevPrimaryDoc != null
      ) {
        return prevPrimaryDoc;
      }

      setCurrentPageId(pageId);

      // set undefined
      if (!isEnabled) {
        return undefined;
      }

      _primaryDoc = new Y.Doc();

      return _primaryDoc;
    });

    // cleanup
    return () => {
      _primaryDoc?.destroy();
    };
  }, [isEnabled, currentPageId, pageId]);

  // Setup secondaryDoc
  useEffect(() => {

    let _secondaryDoc: Y.Doc;

    setSecondaryDoc((prevSecondaryDoc) => {
      // keep the current ydoc if the conditions are met
      if (isEnabled
          // the given page ID is not null
          && pageId != null
          // the current page ID matches the given page ID,
          && currentPageId === pageId
          // the main document is already initialized
          && prevSecondaryDoc != null
          // the review mode status matches the presence of the review document
          && useSecondary === (prevSecondaryDoc != null)) {

        return prevSecondaryDoc;
      }

      // set undefined
      if (!isEnabled || primaryDoc == null || !useSecondary) {
        return undefined;
      }

      _secondaryDoc = new Y.Doc();

      const text = primaryDoc.getText('codemirror');

      // initialize secondaryDoc with primaryDoc state
      Y.applyUpdate(_secondaryDoc, Y.encodeStateAsUpdate(primaryDoc));
      // Setup sync from primaryDoc to secondaryDoc
      text.observe((event) => {
        if (event.transaction.local) return;
        Y.applyUpdate(_secondaryDoc, Y.encodeStateAsUpdate(primaryDoc));
      });

      return _secondaryDoc;
    });

    // cleanup
    return () => {
      _secondaryDoc?.destroy();
    };

  }, [isEnabled, currentPageId, pageId, primaryDoc, useSecondary]);

  // Handle secondaryDoc to primaryDoc sync when exiting review mode
  // useEffect(() => {
  //   if (!isEnabled || reviewMode || !secondaryDoc || !primaryDoc) {
  //     return;
  //   }

  //   Y.applyUpdate(primaryDoc, Y.encodeStateAsUpdate(secondaryDoc));
  //   secondaryDoc.destroy();
  //   setsecondaryDoc(null);
  // }, [isEnabled, reviewMode, secondaryDoc, primaryDoc]);


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
