import React from 'react';

import type { IThreadRelationPaginate } from '../../../../interfaces/thread-relation';

type Props = {
  threadRelations: IThreadRelationPaginate[];
}

export const ThreadList: React.FC<Props> = ({ threadRelations }) => {
  const dummyData = ['アシスタントの有効な活用方法', 'GROWI AI 機能について'];

  return (
    <>
      <ul className="list-group">
        {dummyData.map(thread => (
          <li
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
              <p className="text-truncate m-auto">{thread ?? 'Untitled thread'}</p>
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
        ))}
      </ul>
    </>
  );
};
