import { useEffect, useState } from 'react';

import type { Extension } from '@codemirror/state';
import { keymap, scrollPastEnd } from '@codemirror/view';
import { GlobalSocketEventName } from '@growi/core/dist/interfaces';
import { useGlobalSocket, GLOBAL_SOCKET_NS } from '@growi/core/dist/swr';
// see: https://github.com/yjs/y-codemirror.next#example
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { yCollab } from 'y-codemirror.next';
import { SocketIOProvider } from 'y-socket.io';
import * as Y from 'yjs';

import { GlobalCodeMirrorEditorKey, AcceptedUploadFileType, userColor } from '../consts';
import { useCodeMirrorEditorIsolated } from '../stores';

import { CodeMirrorEditor } from '.';

const additionalExtensions: Extension[] = [
  scrollPastEnd(),
];

type Props = {
  onChange?: (value: string) => void,
  onSave?: () => void,
  onUpload?: (files: File[]) => void,
  acceptedFileType?: AcceptedUploadFileType,
  indentSize?: number,
  userName?: string,
  pageId?: string,
  initialValue?: string,
  onOpenEditor?: (markdown: string) => void,
}

export const CodeMirrorEditorMain = (props: Props): JSX.Element => {
  const {
    onSave, onChange, onUpload, acceptedFileType, indentSize, userName, pageId, initialValue, onOpenEditor,
  } = props;

  const { data: codeMirrorEditor } = useCodeMirrorEditorIsolated(GlobalCodeMirrorEditorKey.MAIN);
  const { data: socket } = useGlobalSocket();

  const [ydoc, setYdoc] = useState<Y.Doc | null>(null);
  const [provider, setProvider] = useState<SocketIOProvider | null>(null);
  const [cPageId, setCPageId] = useState(pageId);
  const [isInit, setIsInit] = useState(false);

  const acceptedFileTypeNoOpt = acceptedFileType ?? AcceptedUploadFileType.NONE;

  // Cleanup ydoc and socketIOProvider when the page id changes
  useEffect(() => {
    if (cPageId === pageId) {
      return;
    }

    // Cleanup existing ydoc
    ydoc?.destroy();
    setYdoc(null);

    // Disconnect and destroy the existing socketIOProvider
    provider?.disconnect();
    provider?.destroy();
    setProvider(null);

    // Remove the sync event listener
    // TODO: catch ydoc:sync:error GlobalSocketEventName.YDocSyncError
    socket.off(GlobalSocketEventName.YDocSync);

    // Reset initialization state and update the current pageId
    setIsInit(false);
    setCPageId(pageId);
  }, [cPageId, pageId, provider, socket, ydoc]);

  // Setup ydoc when it's not setuped
  useEffect(() => {
    if (ydoc != null) {
      return;
    }

    const _ydoc = new Y.Doc();
    setYdoc(_ydoc);
  }, [ydoc]);

  // Setup socketIOProvider and sync to server
  useEffect(() => {
    if (provider != null || ydoc == null || socket == null) {
      return;
    }

    // Create a new SocketIOProvider
    const socketIOProvider = new SocketIOProvider(
      GLOBAL_SOCKET_NS,
      `yjs/${pageId}`,
      ydoc,
      { autoConnect: true },
    );

    // Set local user information for awareness
    socketIOProvider.awareness.setLocalStateField('user', {
      name: userName ? `${userName}` : `Guest User ${Math.floor(Math.random() * 100)}`,
      color: userColor.color,
      colorLight: userColor.light,
    });

    // Add a sync event listener to initiate synchronization
    socketIOProvider.on('sync', (isSync: boolean) => {
      if (isSync) {
        socket.emit(GlobalSocketEventName.YDocSync, { pageId, initialValue });
      }
    });

    // Set the new provider
    setProvider(socketIOProvider);
  }, [initialValue, pageId, provider, socket, userName, ydoc]);

  // Attach YDoc extensions to CodeMirror
  useEffect(() => {
    if (ydoc == null || provider == null) {
      return;
    }

    const ytext = ydoc.getText('codemirror');
    const undoManager = new Y.UndoManager(ytext);

    const cleanup = codeMirrorEditor?.appendExtensions?.([
      yCollab(ytext, provider.awareness, { undoManager }),
    ]);

    return cleanup;
  }, [codeMirrorEditor, provider, ydoc]);

  // Initialize markdown and preview
  useEffect(() => {
    if (ydoc == null || onOpenEditor == null || isInit === true) {
      return;
    }

    const ytext = ydoc.getText('codemirror');

    // Initialize CodeMirror Doc and Preview value
    codeMirrorEditor?.initDoc(ytext.toString());
    onOpenEditor(ytext.toString());

    setIsInit(true);
  }, [codeMirrorEditor, isInit, onOpenEditor, ydoc]);

  // setup additional extensions
  useEffect(() => {
    return codeMirrorEditor?.appendExtensions?.(additionalExtensions);
  }, [codeMirrorEditor]);

  // set handler to save with shortcut key
  useEffect(() => {
    if (onSave == null) {
      return;
    }

    const extension = keymap.of([
      {
        key: 'Mod-s',
        preventDefault: true,
        run: () => {
          const doc = codeMirrorEditor?.getDoc();
          if (doc != null) {
            onSave();
          }
          return true;
        },
      },
    ]);

    const cleanupFunction = codeMirrorEditor?.appendExtensions?.(extension);

    return cleanupFunction;
  }, [codeMirrorEditor, onSave]);


  return (
    <CodeMirrorEditor
      editorKey={GlobalCodeMirrorEditorKey.MAIN}
      onChange={onChange}
      onUpload={onUpload}
      acceptedFileType={acceptedFileTypeNoOpt}
      indentSize={indentSize}
    />
  );
};
