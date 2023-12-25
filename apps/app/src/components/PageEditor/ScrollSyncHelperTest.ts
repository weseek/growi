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

let topY = 0;
const padding = 0;

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
    return elements[index].getBoundingClientRect().y < topY + padding;
  };

  return elementBinarySearch(elements, find);
};

const findTopElement = (elements: Array<Element>): Element => {
  return elements[findTopElementIndex(elements)];
};

const findPreviewElement = (previewElements: Array<Element>, editorElementLine: number): Element => {

  const find = (index: number): boolean => {
    const data = +(previewElements[index].getAttribute('data-line') ?? '0');
    return data <= editorElementLine;
  };

  return previewElements[elementBinarySearch(previewElements, find)];
};


const calcScrollElementToTop = (element: Element): number => {
  return element.getBoundingClientRect().y - (topY + padding);
};

const calcScorllElementByRatio = (sourceElement: Element, targetElement: Element): number => {
  // console.log('calc raito');
  // console.log(sourceElement.getBoundingClientRect());
  // console.log(targetElement.getBoundingClientRect());
  return 0;
};

export const scrollEditor = (editorRootElement: HTMLElement, previewRootElement: HTMLElement): void => {

  topY = editorRootElement.getBoundingClientRect().y;

  const editorElements = getEditorElements(editorRootElement);
  const previewElements = getPreviewElements(previewRootElement);

  const topEditorElementIndex = findTopElementIndex(editorElements);

  const sourceEditorElement = editorElements[topEditorElementIndex];
  const targetPreviewElement = findPreviewElement(previewElements, topEditorElementIndex + 1);

  let newScrollTop = previewRootElement.scrollTop;
  newScrollTop += calcScrollElementToTop(targetPreviewElement);
  newScrollTop += calcScorllElementByRatio(sourceEditorElement, targetPreviewElement);


  console.log(previewRootElement.scrollTop, newScrollTop);
  previewRootElement.scrollTo({ top: newScrollTop, behavior: 'smooth' });

  // console.log(topEditorElement);
  // console.log(topEditorElement.getBoundingClientRect());
  // console.log(editorRootElement.scrollTop);

};


export const scrollPreview = (editorRootElement: HTMLElement, previewRootElement: HTMLElement): void => {

  // topY = previewRootElement.getBoundingClientRect().y;

  // const previewElements = getPreviewElements(previewRootElement);

  // const topPreviewElementIndex = findTopElementIndex(previewElements);

  // console.log(previewRootElement.scrollTop);
  // console.log(previewElements[topPreviewElementIndex]);
  // console.log(previewElements[topPreviewElementIndex].getBoundingClientRect());

  // console.log(topPreviewElement);
  // console.log(topPreviewElement.getBoundingClientRect());
  // console.log(previewRootElement.scrollTop);

};
