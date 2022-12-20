import { useCurrentPageId } from '~/stores/context';
import { useSetupGlobalSocket, useSetupGlobalSocketForPage } from '~/stores/websocket';

export const ClientInitializer = (): JSX.Element => {
  const { data: pageId } = useCurrentPageId();
  useSetupGlobalSocket();
  useSetupGlobalSocketForPage(pageId ?? '');
  return <></>;
};
