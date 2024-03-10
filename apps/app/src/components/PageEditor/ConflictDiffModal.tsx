import React, {
  useState, useEffect, useCallback, useMemo,
} from 'react';

import type { IRevisionOnConflict } from '@growi/core';
import {
  MergeViewer, CodeMirrorEditorDiff, GlobalCodeMirrorEditorKey, useCodeMirrorEditorIsolated,
} from '@growi/editor';
import { UserPicture } from '@growi/ui/dist/components';
import { format } from 'date-fns';
import { useTranslation } from 'next-i18next';
import {
  Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';

import { toastError, toastSuccess } from '~/client/util/toastr';
import { useCurrentPathname, useCurrentUser } from '~/stores/context';
import { useConflictDiffModal } from '~/stores/modal';
import { useCurrentPagePath, useSWRxCurrentPage, useCurrentPageId } from '~/stores/page';
import {
  useRemoteRevisionBody, useRemoteRevisionId, useRemoteRevisionLastUpdatedAt, useRemoteRevisionLastUpdateUser, useSetRemoteLatestPageData,
} from '~/stores/remote-latest-page';

import styles from './ConflictDiffModal.module.scss';

type ConflictDiffModalCoreProps = {
  // optionsToSave: OptionsToSave | undefined;
  request: IRevisionOnConflictWithStringDate,
  latest: IRevisionOnConflictWithStringDate,
  onClose?: () => void,
  onResolved?: () => void,
};

type IRevisionOnConflictWithStringDate = Omit<IRevisionOnConflict, 'createdAt'> & {
  createdAt: string
}

const ConflictDiffModalCore = (props: ConflictDiffModalCoreProps): JSX.Element => {
  const {
    request, latest, onClose, onResolved,
  } = props;

  const [resolvedRevision, setResolvedRevision] = useState<string>('');
  const [isRevisionselected, setIsRevisionSelected] = useState<boolean>(false);
  const [revisionSelectedToggler, setRevisionSelectedToggler] = useState<boolean>(false);
  const [isModalExpanded, setIsModalExpanded] = useState<boolean>(false);

  const { t } = useTranslation();
  const { data: conflictDiffModalStatus, close: closeConflictDiffModal } = useConflictDiffModal();
  const { data: codeMirrorEditor } = useCodeMirrorEditorIsolated(GlobalCodeMirrorEditorKey.DIFF);

  // const { data: remoteRevisionId } = useRemoteRevisionId();
  // const { setRemoteLatestPageData } = useSetRemoteLatestPageData();
  // const { data: pageId } = useCurrentPageId();
  // const { data: currentPagePath } = useCurrentPagePath();
  // const { data: currentPathname } = useCurrentPathname();

  const selectRevisionHandler = useCallback((selectedRevision: string) => {
    setResolvedRevision(selectedRevision);
    setRevisionSelectedToggler(prev => !prev);

    if (!isRevisionselected) {
      setIsRevisionSelected(true);
    }
  }, [isRevisionselected]);

  const closeModalHandler = useCallback(() => {
    closeConflictDiffModal();
    onClose?.();
  }, [closeConflictDiffModal, onClose]);

  const resolveConflictHandler = useCallback(async() => {
    const newBody = codeMirrorEditor?.getDoc();

    // TODO: impl
    onResolved?.();
  }, [codeMirrorEditor, onResolved]);

  useEffect(() => {
    codeMirrorEditor?.initDoc(resolvedRevision);
    // Enable selecting the same revision after editing by including revisionSelectedToggler in the dependency array of useEffect
  }, [codeMirrorEditor, resolvedRevision, revisionSelectedToggler]);

  const headerButtons = useMemo(() => (
    <div className="d-flex align-items-center">
      <button type="button" className="btn" onClick={() => setIsModalExpanded(prev => !prev)}>
        <span className="material-symbols-outlined">{isModalExpanded ? 'close_fullscreen' : 'open_in_full'}</span>
      </button>
      <button type="button" className="btn" onClick={closeModalHandler} aria-label="Close">
        <span className="material-symbols-outlined">close</span>
      </button>
    </div>
  ), [closeModalHandler, isModalExpanded]);

  return (
    <Modal isOpen={conflictDiffModalStatus?.isOpened} className={`${styles['conflict-diff-modal']} ${isModalExpanded ? ' grw-modal-expanded' : ''}`} size="xl">

      <ModalHeader tag="h4" className="d-flex align-items-center" close={headerButtons}>
        <span className="material-symbols-outlined me-1">error</span>{t('modal_resolve_conflict.resolve_conflict')}
      </ModalHeader>

      <ModalBody className="mx-4 my-1">
        <div className="row">
          <div className="col-12 text-center mt-2 mb-4">
            <h3 className="fw-bold text-muted">{t('modal_resolve_conflict.resolve_conflict_message')}</h3>
          </div>

          <div className="col-6">
            <h4 className="fw-bold my-2 text-muted">{t('modal_resolve_conflict.requested_revision')}</h4>
            <div className="d-flex align-items-center my-3">
              <div>
                <UserPicture user={request.user} size="lg" noLink noTooltip />
              </div>
              <div className="ms-3 text-muted">
                <p className="my-0">updated by {request.user.username}</p>
                <p className="my-0">{request.createdAt}</p>
              </div>
            </div>
          </div>

          <div className="col-6">
            <h4 className="fw-bold my-2 text-muted">{t('modal_resolve_conflict.latest_revision')}</h4>
            <div className="d-flex align-items-center my-3">
              <div>
                <UserPicture user={latest.user} size="lg" noLink noTooltip />
              </div>
              <div className="ms-3 text-muted">
                <p className="my-0">updated by {latest.user.username}</p>
                <p className="my-0">{latest.createdAt}</p>
              </div>
            </div>
          </div>

          <MergeViewer
            leftBody={request.revisionBody}
            rightBody={latest.revisionBody}
          />

          <div className="col-6">
            <div className="text-center my-4">
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={() => { selectRevisionHandler(request.revisionBody) }}
              >
                <span className="material-symbols-outlined me-1">arrow_circle_down</span>
                {t('modal_resolve_conflict.select_revision', { revision: 'mine' })}
              </button>
            </div>
          </div>

          <div className="col-6">
            <div className="text-center my-4">
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={() => { selectRevisionHandler(latest.revisionBody) }}
              >
                <span className="material-symbols-outlined me-1">arrow_circle_down</span>
                {t('modal_resolve_conflict.select_revision', { revision: 'theirs' })}
              </button>
            </div>
          </div>

          <div className="col-12">
            <div className="border border-dark">
              <h4 className="fw-bold my-2 mx-2 text-muted">{t('modal_resolve_conflict.selected_editable_revision')}</h4>
              <CodeMirrorEditorDiff />
            </div>
          </div>
        </div>
      </ModalBody>

      <ModalFooter>
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={closeModalHandler}
        >
          {t('Cancel')}
        </button>
        <button
          type="button"
          className="btn btn-primary ms-3"
          onClick={resolveConflictHandler}
          disabled={!isRevisionselected}
        >
          {t('modal_resolve_conflict.resolve_and_save')}
        </button>
      </ModalFooter>
    </Modal>
  );
};


const dummyTest1 = `# :tada: グローウィ へようこそ
[![GitHub Releases](https://img.shields.io/github/release/weseek/growi.svg)](https://github.com/weseek/growi/releases/latest)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat)](https://github.com/weseek/growi/blob/master/LICENSE)

グローウィ は個人・法人向けの Wiki | ナレッジベースツールです。
会社や大学の研究室、サークルでのナレッジ情報を簡単に共有でき、作られたページは誰でも編集が可能です。

知っている情報をカジュアルに書き出しみんなで編集することで、**チーム内での暗黙知を減らす**ことができます。
当たり前に共有される情報を日々増やしていきましょう。

### :beginner: 簡単なページの作り方

- 右上の "**作成**"ボタンまたは右下の**鉛筆アイコン**のボタンからページを書き始めることができます
    - ページタイトルは後から変更できますので、適当に入力しても大丈夫です
        - タイトル入力欄では、半角の / (スラッシュ) でページ階層を作れます
        - （例）/カテゴリ1/カテゴリ2/作りたいページタイトル のように入力してみてください
- \`\`- \` を行頭につけると、この文章のような箇条書きを書くことができます\`\`
- 画像やPDF、Word/Excel/PowerPointなどの添付ファイルも、コピー＆ペースト、ドラッグ＆ドロップで貼ることができます
- 書けたら "**更新**" ボタンを押してページを公開しましょう
    - \`Ctrl(⌘) + S\` でも保存できます

さらに詳しくはこちら: [ページを作成する](https://docs.growi.org/ja/guide/features/create_page.html)

<div class="mt-4 card border-primary">
  <div class="card-header bg-primary text-light">Tips</div>
  <div class="card-body"><ul>
    <li>Ctrl(⌘) + "/" でショートカットヘルプを表示します</li>
    <li>HTML/CSS の記述には、<a href="https://getbootstrap.com/docs/4.6/components/">Bootstrap 4</a> を利用できます</li>
  </ul></div>
</div>
`;

const dummyTest2 = `# :tada: GROWI へようこそ
[![GitHub Releases](https://img.shields.io/github/release/weseek/growi.svg)](https://github.com/weseek/growi/releases/latest)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat)](https://github.com/weseek/growi/blob/master/LICENSE)

GROWI は個人・法人向けの Wiki | ナレッジベースツールです。
会社や大学の研究室、サークルでのナレッジ情報を簡単に共有でき、作られたページは誰でも編集が可能です。

知っている情報をカジュアルに書き出しみんなで編集することで、**チーム内での暗黙知を減らす**ことができます。
当たり前に共有される情報を日々増やしていきましょう。

### :beginner: 簡単なページの作り方

- 右上の "**作成**"ボタンまたは右下の**鉛筆アイコン**のボタンからページを書き始めることができます
    - ページタイトルは後から変更できますので、適当に入力しても大丈夫です
        - タイトル入力欄では、半角の / (スラッシュ) でページ階層を作れます
        - （例）/カテゴリ1/カテゴリ2/作りたいページタイトル のように入力してみてください
- \`\`- \` を行頭につけると、この文章のような箇条書きを書くことができます\`\`
- 画像やPDF、Word/Excel/PowerPointなどの添付ファイルも、コピー＆ペースト、ドラッグ＆ドロップで貼ることができます
- 書けたら "**更新**" ボタンを押してページを公開しましょう
    - \`Ctrl(⌘) + S\` でも保存できます

さらに詳しくはこちら: [ページを作成する](https://docs.growi.org/ja/guide/features/create_page.html)

<div class="mt-4 card border-primary">
  <div class="card-header bg-primary text-light">Tips</div>
  <div class="card-body"><ul>
    <li>Ctrl(⌘) + "/" でショートカットヘルプを表示します</li>
    <li>HTML/CSS の記述には、<a href="https://getbootstrap.com/docs/4.6/components/">Bootstrap 4</a> を利用できます</li>
  </ul></div>
</div>
`;

type ConflictDiffModalProps = {
  onClose?: () => void,
  onResolved?: () => void,
  // optionsToSave: OptionsToSave | undefined;
  // afterResolvedHandler: () => void,
};


export const ConflictDiffModal = (props: ConflictDiffModalProps): JSX.Element => {
  const {
    onClose, onResolved,
  } = props;
  const { data: currentUser } = useCurrentUser();

  // state for current page
  const { data: currentPage } = useSWRxCurrentPage();

  // state for latest page
  const { data: remoteRevisionId } = useRemoteRevisionId();
  const { data: remoteRevisionBody } = useRemoteRevisionBody();
  const { data: remoteRevisionLastUpdateUser } = useRemoteRevisionLastUpdateUser();
  const { data: remoteRevisionLastUpdatedAt } = useRemoteRevisionLastUpdatedAt();

  const { data: conflictDiffModalStatus } = useConflictDiffModal();

  const isRemotePageDataInappropriate = remoteRevisionId == null || remoteRevisionBody == null || remoteRevisionLastUpdateUser == null;

  if (!conflictDiffModalStatus?.isOpened || currentUser == null || currentPage == null || isRemotePageDataInappropriate) {
    return <></>;
  }

  const currentTime: Date = new Date();

  const request: IRevisionOnConflictWithStringDate = {
    revisionId: '',
    revisionBody: conflictDiffModalStatus.requestRevisionBody ?? '',
    createdAt: format(currentTime, 'yyyy/MM/dd HH:mm:ss'),
    user: currentUser,
  };

  const latest: IRevisionOnConflictWithStringDate = {
    revisionId: remoteRevisionId,
    revisionBody: remoteRevisionBody,
    createdAt: format(new Date(remoteRevisionLastUpdatedAt || currentTime.toString()), 'yyyy/MM/dd HH:mm:ss'),
    user: remoteRevisionLastUpdateUser,
  };

  const propsForCore = {
    onResolved,
    onClose,
    request,
    latest,
  };

  return <ConflictDiffModalCore {...propsForCore} />;
};
