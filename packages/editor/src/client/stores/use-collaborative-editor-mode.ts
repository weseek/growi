import { useEffect, useState } from 'react';

import { StateEffect } from '@codemirror/state';
import { keymap } from '@codemirror/view';
import type { IUserHasId } from '@growi/core/dist/interfaces';
import { useGlobalSocket } from '@growi/core/dist/swr';
import { yCollab, yUndoManagerKeymap } from 'y-codemirror.next';
import { SocketIOProvider } from 'y-socket.io';
import * as Y from 'yjs';

import { userColor } from '../../consts';
import type { Delta } from '../../interfaces';
import type { UseCodeMirrorEditor } from '../services';

type UserLocalState = {
  name: string;
  user?: IUserHasId;
  color: string;
  colorLight: string;
}

// collaborative changesを通知するための StateEffect
export const collaborativeChange = StateEffect.define<Delta>();

export const useCollaborativeEditorMode = (
    isEnabled: boolean,
    user?: IUserHasId,
    pageId?: string,
    initialValue?: string,
    onEditorsUpdated?: (userList: IUserHasId[]) => void,
    codeMirrorEditor?: UseCodeMirrorEditor,
): void => {
  const [ydoc, setYdoc] = useState<Y.Doc | null>(null);
  const [provider, setProvider] = useState<SocketIOProvider | null>(null);
  const [cPageId, setCPageId] = useState(pageId);

  const { data: socket } = useGlobalSocket();

  // Cleanup Ydoc
  useEffect(() => {
    if (cPageId === pageId && isEnabled) {
      return;
    }

    ydoc?.destroy();
    setYdoc(null);

    // NOTICE: Destroying the provider leaves awareness in the other user's connection,
    // so only awareness is destroyed here
    provider?.awareness.destroy();

    setCPageId(pageId);

    // reset editors
    onEditorsUpdated?.([]);
  }, [cPageId, isEnabled, onEditorsUpdated, pageId, provider?.awareness, socket, ydoc]);

  // Setup Ydoc
  useEffect(() => {
    if (ydoc != null || !isEnabled) {
      return;
    }

    // NOTICE: Old provider destroy at the time of ydoc setup,
    // because the awareness destroying is not sync to other clients
    provider?.destroy();
    setProvider(null);

    const _ydoc = new Y.Doc();
    setYdoc(_ydoc);
  }, [isEnabled, provider, ydoc]);

  // Setup provider
  useEffect(() => {
    if (provider != null || pageId == null || ydoc == null || socket == null) {
      return;
    }

    const socketIOProvider = new SocketIOProvider(
      '/',
      pageId,
      ydoc,
      {
        autoConnect: true,
        resyncInterval: 3000,
      },
    );

    const userLocalState: UserLocalState = {
      name: user?.name ? `${user.name}` : `Guest User ${Math.floor(Math.random() * 100)}`,
      user,
      color: userColor.color,
      colorLight: userColor.light,
    };

    socketIOProvider.awareness.setLocalStateField('user', userLocalState);

    socketIOProvider.on('sync', (isSync: boolean) => {
      if (isSync && onEditorsUpdated != null) {
        const userList: IUserHasId[] = Array.from(socketIOProvider.awareness.states.values(), value => value.user.user && value.user.user);
        onEditorsUpdated(userList);
      }
    });

    // update args type see: SocketIOProvider.Awareness.awarenessUpdate
    socketIOProvider.awareness.on('update', (update: { added: unknown[]; removed: unknown[]; }) => {
      if (onEditorsUpdated == null) return;

      const { added, removed } = update;
      if (added.length > 0 || removed.length > 0) {
        const userList: IUserHasId[] = Array.from(socketIOProvider.awareness.states.values(), value => value.user.user && value.user.user);
        onEditorsUpdated(userList);
      }
    });

    setProvider(socketIOProvider);
  }, [initialValue, onEditorsUpdated, pageId, provider, socket, user, ydoc]);

  // Setup Ydoc Extensions
  useEffect(() => {
    if (ydoc == null || provider == null || codeMirrorEditor == null) {
      return;
    }

    const ytext = ydoc.getText('codemirror');
    const undoManager = new Y.UndoManager(ytext);

    const extensions = [
      keymap.of(yUndoManagerKeymap),
      yCollab(ytext, provider.awareness, { undoManager }),
    ];

    // Setup observer for collaborative changes
    ytext.observe((event) => {
      if (event.transaction.local) return;

      // 外部からの変更があったことを通知
      codeMirrorEditor.view?.dispatch({
        effects: collaborativeChange.of(event.delta),
      });
    });

    const cleanupFunctions = extensions.map(ext => codeMirrorEditor.appendExtensions([ext]));

    return () => {
      cleanupFunctions.forEach(cleanup => cleanup?.());
      codeMirrorEditor.initDoc('');
    };
  }, [codeMirrorEditor, provider, ydoc]);
};
