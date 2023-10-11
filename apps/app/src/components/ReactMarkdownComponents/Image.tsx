import React from 'react';

import EventEmitter from 'events';

import { Element } from 'react-markdown/lib/rehype-filter';

import { useImageEditorModal } from '~/stores/modal';

declare global {
  // eslint-disable-next-line vars-on-top, no-var
  var globalEmitter: EventEmitter;
}

type Props = {
  src?: string
  alt?: string
  node: Element,
}

function generateReplaceTargetPostion(node: Element) {
  if (node.position?.start.line == null || node.position?.start.column == null || node.position?.end.line == null || node.position?.end.column == null) {
    return;
  }

  const from = {
    line: node.position?.start.line - 1,
    ch: node.position?.start.column - 1,
  };

  const to = {
    line: node.position?.end.line - 1,
    ch: node.position?.end.column - 1,
  };

  return { from, to };
}

export const Image = (props: Props): JSX.Element => {
  const { src, alt, node } = props;

  const replaceTargetPosition = generateReplaceTargetPostion(node);

  const setEditedImagePath = (editedImagePath?: string) => {
    if (editedImagePath == null || replaceTargetPosition == null) {
      return;
    }

    globalEmitter.emit('setEditedImagePath', editedImagePath, replaceTargetPosition.from, replaceTargetPosition.to);
  };

  const { open: openImageEditorModal } = useImageEditorModal();

  if (src == null) {
    return <></>;
  }

  return (
    <>
      {/* TODO: Do not pass onClick() for URLs other than attachment */}
      <img src={src} alt={alt} onClick={() => openImageEditorModal(src, setEditedImagePath)} />
    </>
  );
};
