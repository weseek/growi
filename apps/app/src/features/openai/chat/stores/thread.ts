import useSWRSubscription from 'swr/subscription';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useSWRSUBxOpenaiRun = (threadId: string, runId: string) => {
  return useSWRSubscription(
    ['openaiRun', threadId, runId],
    ([, threadId, runId], { next }) => {

      // SSEを実装したサーバに接続する
      const eventSource = new EventSource(`/_api/v3/openai/thread/${threadId}/run/${runId}/subscribe`);

      // TODO: Error handling
      // eventSource.onerror = () => {
      // };

      eventSource.onmessage = (event) => {
        console.log({ event });

        // const parsedData = JSON.parse(event.data);

        // if (parsedData.event === 'error') {
        //   next(parsedData.error);
        //   return;
        // }

        // next(null, parsedData.data);
      };

      return () => eventSource.close();
    },
  );
};
