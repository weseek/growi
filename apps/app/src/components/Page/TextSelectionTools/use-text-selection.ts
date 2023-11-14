// https://storybook.react-laag.com/?path=/docs/text-selection--page

import {
  type RefObject, useEffect, useRef, useState,
} from 'react';


type TextSelection = {
  range: Range | undefined,
  ref: RefObject<HTMLDivElement>,
}

export const useTextSelection = (): TextSelection => {
  // we need a reference to the element wrapping the text in order to determine
  // if the selection is the selection we are after
  const ref = useRef<HTMLDivElement>(null);

  const [isMouseDown, setMouseDown] = useState(false);

  // we store info about the current Range here
  const [range, setRange] = useState<Range>();

  useEffect(() => {
    function handleMouseDown() {
      setMouseDown(true);
    }
    function handleMouseUp() {
      setMouseDown(false);
    }

    const currentElem = ref.current;

    currentElem?.addEventListener('mousedown', handleMouseDown);
    currentElem?.addEventListener('mouseup', handleMouseUp);
    return () => {
      currentElem?.removeEventListener('mousedown', handleMouseDown);
      currentElem?.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // In this effect we're registering for the documents "selectionchange" event
  useEffect(() => {
    function handleChange() {
      // get selection information from the browser
      const selection = window.getSelection();

      // we only want to proceed when we have a valid selection
      if (
        !selection
        || selection.isCollapsed
        || ref.current == null
        || !selection.containsNode(ref.current, true)
      ) {
        setRange(undefined);
        return;
      }

      console.log({ selection, range: selection.getRangeAt(0) });

      setRange(selection.getRangeAt(0));
    }

    document.addEventListener('selectionchange', handleChange);
    return () => document.removeEventListener('selectionchange', handleChange);
  }, []);

  return {
    ref,
    range: isMouseDown ? undefined : range,
  };
};
