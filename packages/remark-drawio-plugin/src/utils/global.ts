import { IGraphViewer } from '../interfaces/graph-viewer';

export const isGraphViewer = (val: unknown): val is IGraphViewer => {
  return (typeof val === 'function' && 'createViewerForElement' in val && 'processElements' in val);
};
