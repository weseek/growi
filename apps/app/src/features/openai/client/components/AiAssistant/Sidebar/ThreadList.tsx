import React from 'react';

import InfiniteScroll from '~/client/components/InfiniteScroll';
import { useSWRINFxRecentThreads } from '~/features/openai/client/stores/thread';

export const ThreadList: React.FC = () => {

  const swrInifiniteThreads = useSWRINFxRecentThreads({ suspense: true });
  const { data } = swrInifiniteThreads;

  const isEmpty = data?.[0]?.paginateResult.totalDocs === 0;
  const isReachingEnd = isEmpty || (data != null && (data[data.length - 1].paginateResult.hasNextPage === false));

  return (
    <>
      <ul className="list-group">
        <InfiniteScroll swrInifiniteResponse={swrInifiniteThreads} isReachingEnd={isReachingEnd}>
          { data != null && data.map(thread => thread.paginateResult.docs).flat()
            .map(thread => (
              <li
                key={thread._id}
                role="button"
                className="list-group-item list-group-item-action border-0 d-flex align-items-center rounded-1"
                onClick={(e) => {
                  e.stopPropagation();
                  // openChatHandler();
                }}
              >
                <div>
                  <span className="material-symbols-outlined fs-5">chat</span>
                </div>

                <div className="grw-ai-assistant-title-anchor ps-1">
                  <p className="text-truncate m-auto">{thread.title ?? 'Untitled thread'}</p>
                </div>

                <div className="grw-ai-assistant-actions opacity-0 d-flex justify-content-center ">
                  <button
                    type="button"
                    className="btn btn-link text-secondary p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      // deleteThreadHandler();
                    }}
                  >
                    <span className="material-symbols-outlined fs-5">delete</span>
                  </button>
                </div>
              </li>
            ))
          }
        </InfiniteScroll>
      </ul>
    </>
  );
};
