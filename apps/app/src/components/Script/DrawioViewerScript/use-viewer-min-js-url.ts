import { useRendererConfig } from '~/stores/context';

export const useViewerMinJsUrl = (): string => {
  const { data: rendererConfig } = useRendererConfig();

  return (new URL('/js/viewer.min.js', rendererConfig?.drawioUri ?? 'http://localhost')).toString();
};
