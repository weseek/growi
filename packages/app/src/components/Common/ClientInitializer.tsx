import { useSetupGlobalSocket, useSetupGlobalSocketForPage } from '~/stores/websocket';

export const ClientInitializer = (props: {pageId: string}): JSX.Element => {
  const { pageId } = props;
  useSetupGlobalSocket();
  useSetupGlobalSocketForPage(pageId);
  return <></>;
};
