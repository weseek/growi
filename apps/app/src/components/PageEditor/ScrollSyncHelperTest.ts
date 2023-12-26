// console.log(previewRootElement.scrollTop);
// for (const element of previewElements) {
//   console.log(element.getBoundingClientRect());
// }

// element.getBoundingClientRect
// {
//     "x": 85,
//     "y": 907.203125,
//     "width": 650.5,
//     "height": 22.390625,
//     "top": 907.203125,
//     "right": 735.5,
//     "bottom": 929.59375,
//     "left": 85
// }

// fn return true when arg nubmer's comparison is lower.
// list: [1, 3, 4, 6, 7, 9]
// fn: (args) => {return list[args] < 5}
// output: 4

let defaultTop = 0;
const padding = 5;

const getDataLineIndex = (previewElement: Element): number => {
  return +(previewElement.getAttribute('data-line') ?? '0') - 1;
};

const getEditorElements = (editorRootElement: HTMLElement): Array<Element> => {
  return Array.from(editorRootElement.getElementsByClassName('cm-line'));
};

const getPreviewElements = (previewRootElement: HTMLElement): Array<Element> => {
  return Array.from(previewRootElement.getElementsByClassName('has-data-line'))
    .filter((element) => { return !Number.isNaN(element.getAttribute('data-line')) });
};

const elementBinarySearch = (list: Array<Element>, fn: (index: number) => boolean): number => {
  let ok = 0;
  let ng = list.length;
  while (ok + 1 < ng) {
    const mid = Math.floor((ok + ng) / 2);
    if (fn(mid)) {
      ok = mid;
    }
    else {
      ng = mid;
    }
  }
  return ok;
};

const findTopElementIndex = (elements: Array<Element>): number => {

  const find = (index: number): boolean => {
    return elements[index].getBoundingClientRect().top < defaultTop + padding;
  };

  return elementBinarySearch(elements, find);
};

const findPreviewElementIndex = (previewElements: Array<Element>, editorElementLineIndex: number): number => {

  const find = (index: number): boolean => {
    const data = getDataLineIndex(previewElements[index]);
    return data <= editorElementLineIndex;
  };

  return elementBinarySearch(previewElements, find);
};

const calcScrollElementToTop = (element: Element): number => {
  return element.getBoundingClientRect().top - (defaultTop + padding);
};

type SourceElement = {
  start: Element,
  top: Element,
  next: Element | undefined,
}

type TargetElement = {
  start: Element,
  next: Element | undefined,
}

const calcScorllElementByRatio = (sourceElement: SourceElement, targetElement: TargetElement): number => {
  if (sourceElement.start === sourceElement.next || sourceElement.next == null || targetElement.next == null) {
    return 0;
  }
  const sourceAllHeight = sourceElement.next.getBoundingClientRect().top - sourceElement.start.getBoundingClientRect().top;
  const sourceUseHeight = sourceElement.top.getBoundingClientRect().top - sourceElement.start.getBoundingClientRect().top;
  const sourceTopHeight = defaultTop + padding - sourceElement.top.getBoundingClientRect().top;
  const sourceRaito = (sourceUseHeight + sourceTopHeight) / sourceAllHeight;

  const targetAllHeight = targetElement.next.getBoundingClientRect().top - targetElement.start.getBoundingClientRect().top;

  return targetAllHeight * sourceRaito;
};

export const scrollEditor = (editorRootElement: HTMLElement, previewRootElement: HTMLElement): void => {

  defaultTop = editorRootElement.getBoundingClientRect().top;

  const editorElements = getEditorElements(editorRootElement);
  const previewElements = getPreviewElements(previewRootElement);

  const topEditorElementIndex = findTopElementIndex(editorElements);
  const targetPreviewElementIndex = findPreviewElementIndex(previewElements, topEditorElementIndex);

  const startEditorElementIndex = getDataLineIndex(previewElements[targetPreviewElementIndex]);
  const nextEditorElementIndex = getDataLineIndex(previewElements[targetPreviewElementIndex + 1]);

  let newScrollTop = previewRootElement.scrollTop;

  newScrollTop += calcScrollElementToTop(previewElements[targetPreviewElementIndex]);
  newScrollTop += calcScorllElementByRatio(
    {
      start: editorElements[startEditorElementIndex],
      top: editorElements[topEditorElementIndex],
      next: editorElements[nextEditorElementIndex],
    },
    {
      start: previewElements[targetPreviewElementIndex],
      next: previewElements[targetPreviewElementIndex + 1],
    },
  );

  previewRootElement.scrollTop = newScrollTop;

};


export const scrollPreview = (editorRootElement: HTMLElement, previewRootElement: HTMLElement): void => {

  // defaultTop = previewRootElement.getBoundingClientRect().y;

  // const previewElements = getPreviewElements(previewRootElement);

  // const topPreviewElementIndex = findTopElementIndex(previewElements);

  // console.log(previewRootElement.scrollTop);
  // console.log(previewElements[topPreviewElementIndex]);
  // console.log(previewElements[topPreviewElementIndex].getBoundingClientRect());

  // console.log(topPreviewElement);
  // console.log(topPreviewElement.getBoundingClientRect());
  // console.log(previewRootElement.scrollTop);

};
