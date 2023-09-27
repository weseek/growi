import React, { useEffect, useState } from 'react';

import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import ReactMarkdown from 'react-markdown';

import type { RendererOptions } from '~/interfaces/renderer-options';
import loggerFactory from '~/utils/logger';

import 'katex/dist/katex.min.css';

const logger = loggerFactory('components:Page:RevisionRenderer');

type Props = {
  rendererOptions: RendererOptions,
  markdown: string,
  additionalClassName?: string,
}

const ErrorFallback: React.FC<FallbackProps> = React.memo(({ error, resetErrorBoundary }) => {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
      <button type="button" className="btn btn-primary" onClick={resetErrorBoundary}>Reload</button>
    </div>
  );
});
ErrorFallback.displayName = 'ErrorFallback';

const RevisionRenderer = React.memo((props: Props): JSX.Element => {

  const {
    rendererOptions, markdown, additionalClassName,
  } = props;

  // TODO: Delete these experimental codes when the test is finished.
  rendererOptions.sourcePos = true;
  const [selected, setSelected] = useState('');
  useEffect(() => {
    document.addEventListener('mouseup', () => {
      const sel = window.getSelection();
      console.log(sel);
      if (!sel?.rangeCount) return; // 範囲選択されている箇所がない場合は何もせず終了
      const range = sel.getRangeAt(0);
      const newNode = document.createElement('span');
      newNode.setAttribute('style', 'background-color: blue;'); // 範囲選択箇所の背景を青にする
      newNode.innerHTML = sel.toString();
      // range.deleteContents(); // 範囲選択箇所を一旦削除
      // range.insertNode(newNode); // 範囲選択箇所の先頭から、修飾したspanを挿入
    });
  }, []);

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <ReactMarkdown
        {...rendererOptions}
        className={`wiki ${additionalClassName ?? ''}`}
      >
        {markdown}
      </ReactMarkdown>
      {/* TODO: Remove this line. */}
      <div>{selected}</div>
    </ErrorBoundary>
  );

});
RevisionRenderer.displayName = 'RevisionRenderer';

export default RevisionRenderer;
