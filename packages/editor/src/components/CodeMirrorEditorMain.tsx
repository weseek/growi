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

  const acceptedFileTypeNoOpt = acceptedFileType ?? AcceptedUploadFileType.NONE;

  // cleanup ydoc and socketIOProvider
  useEffect(() => {
    if (cPageId === pageId) {
      return;
    }
    if (provider == null || ydoc == null || socket == null) {
      return;
    }

    ydoc.destroy();
    setYdoc(null);

    provider.destroy();
    provider.disconnect();
    setProvider(null);

    // TODO: catch ydoc:sync:error GlobalSocketEventName.YDocSyncError

    socket.off(GlobalSocketEventName.YDocSync);

    setCPageId(pageId);
  }, [cPageId, pageId, provider, socket, ydoc]);

  // setup ydoc
  useEffect(() => {
    if (ydoc != null) {
      return;
    }

    const _ydoc = new Y.Doc();
    setYdoc(_ydoc);
  }, [ydoc]);

  // setup socketIOProvider and sync ydoc
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
        socket.emit(GlobalSocketEventName.YDocSync, { pageId, initialValue });
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
  }, [codeMirrorEditor, provider, ydoc]);

  // initialize markdown and preview
  useEffect(() => {
    if (ydoc == null || onOpenEditor == null) {
      return;
    }

    const ytext = ydoc.getText('codemirror');
    codeMirrorEditor?.initDoc(ytext.toString());
    onOpenEditor(ytext.toString());
  }, [codeMirrorEditor, onOpenEditor, ydoc]);

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
