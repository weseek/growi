import { useEffect, useState } from 'react';

import type { Extension } from '@codemirror/state';
import { keymap, scrollPastEnd } from '@codemirror/view';
import type { Nullable } from '@growi/core';
// TODO: import socket.io-client types wihtout lint error
// import type { Socket, DefaultEventsMap } from 'socket.io-client';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { yCollab } from 'y-codemirror.next';
import { SocketIOProvider } from 'y-socket.io';
import * as Y from 'yjs';

import { GlobalCodeMirrorEditorKey, AcceptedUploadFileType, userColor } from '../consts';
import { useCodeMirrorEditorIsolated } from '../stores';

import { CodeMirrorEditor } from '.';

// TODO: use SocketEventName
// import { SocketEventName } from '~/interfaces/websocket';
// TODO: import { GLOBAL_SOCKET_NS } from '~/stores/websocket';
const GLOBAL_SOCKET_NS = '/';

const additionalExtensions: Extension[] = [
  scrollPastEnd(),
];


type Props = {
  onChange?: (value: string) => void,
  onSave?: () => void,
  onUpload?: (files: File[]) => void,
  acceptedFileType?: AcceptedUploadFileType,
  indentSize?: number,
  pageId: Nullable<string>,
  userName?: string,
  socket?: any, // Socket<DefaultEventsMap, DefaultEventsMap>,
  initialValue: string,
  setMarkdownToPreview: React.Dispatch<React.SetStateAction<string>>,
}

export const CodeMirrorEditorMain = (props: Props): JSX.Element => {
  const {
    onSave, onChange, onUpload, acceptedFileType, indentSize, pageId, userName, initialValue, socket, setMarkdownToPreview,
  } = props;

  const { data: codeMirrorEditor } = useCodeMirrorEditorIsolated(GlobalCodeMirrorEditorKey.MAIN);
  const [ydoc, setYdoc] = useState<Y.Doc | null>(null);
  const [provider, setProvider] = useState<SocketIOProvider | null>(null);
  const [cPageId, setCPageId] = useState(pageId);

  const acceptedFileTypeNoOpt = acceptedFileType ?? AcceptedUploadFileType.NONE;

  // cleanup ydoc and socketIOProvider
  useEffect(() => {
    if (cPageId === pageId) {
      return;
    }
    if (!provider || !ydoc || socket == null) {
      return;
    }

    ydoc.destroy();
    setYdoc(null);

    provider.destroy();
    provider.disconnect();
    setProvider(null);

    // TODO: catch ydoc:sync:error
    // TODO: use SocketEventName
    socket.off('ydoc:sync');

    setCPageId(pageId);
  }, [cPageId, pageId, provider, socket, ydoc]);

  // setup ydoc
  useEffect(() => {
    if (ydoc != null) {
      return;
    }

    const _ydoc = new Y.Doc();
    setYdoc(_ydoc);
  }, [initialValue, ydoc]);

  // setup socketIOProvider
  useEffect(() => {
    if (ydoc == null || provider != null || socket == null) {
      return;
    }

    const socketIOProvider = new SocketIOProvider(
      GLOBAL_SOCKET_NS,
      `yjs/${pageId}`,
      ydoc,
      { autoConnect: true },
    );

    socketIOProvider.awareness.setLocalStateField('user', {
      name: userName ? `${userName}` : `Guest User ${Math.floor(Math.random() * 100)}`,
      color: userColor.color,
      colorLight: userColor.light,
    });

    socketIOProvider.on('sync', (isSync: boolean) => {
      if (isSync) {
        // TODO: use SocketEventName
        socket.emit('ydoc:sync', { pageId, initialValue });
      }
    });

    // TODO: delete this code
    socketIOProvider.on('status', ({ status: _status }: { status: string }) => {
      if (_status) console.log(_status);
    });

    setProvider(socketIOProvider);
  }, [initialValue, pageId, provider, socket, userName, ydoc]);

  // attach YDoc to CodeMirror
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
  }, [codeMirrorEditor, provider, setMarkdownToPreview, ydoc]);


  // initialize markdown and preview
  useEffect(() => {
    if (ydoc == null) {
      return;
    }

    const ytext = ydoc.getText('codemirror');
    codeMirrorEditor?.initDoc(ytext.toString());
    setMarkdownToPreview(ytext.toString());
    // TODO: Check the reproduction conditions that made this code necessary and confirm reproduction
    // mutateIsEnabledUnsavedWarning(false);
  }, [codeMirrorEditor, initialValue, pageId, setMarkdownToPreview, socket, ydoc]);

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
