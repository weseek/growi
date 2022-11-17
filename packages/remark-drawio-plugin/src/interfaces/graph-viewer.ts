export interface IGraphViewer {
  processElements: () => void,
  createViewerForElement: (Element) => void,

  prototype: {
    lightboxZIndex: number,
    toolbarZIndex: number,
  }
}
