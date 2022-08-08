export interface IGraphViewer {
  createViewerForElement: (Element) => void,
}

export const isGraphViewer = (val: any): val is IGraphViewer => {
  if (typeof val === 'function' && typeof val.createViewerForElement === 'function') {
    return true;
  }

  return false;
};
