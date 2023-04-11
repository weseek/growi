import { ReactNode } from 'react';

import type { CodeComponent } from 'react-markdown-customkeyprop/lib/ast-to-react';
import { PrismAsyncLight } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';

import styles from './CodeBlock.module.scss';


function extractChildrenToIgnoreReactNode(children: ReactNode): ReactNode {

  if (children == null) {
    return children;
  }

  // Single element array
  if (Array.isArray(children) && children.length === 1) {
    return extractChildrenToIgnoreReactNode(children[0]);
  }

  // Multiple element array
  if (Array.isArray(children) && children.length > 1) {
    return children.map(node => extractChildrenToIgnoreReactNode(node)).join('');
  }

  // object
  if (typeof children === 'object') {
    const grandChildren = (children as any).children ?? (children as any).props.children;
    return extractChildrenToIgnoreReactNode(grandChildren);
  }

  return String(children).replace(/\n$/, '');
}

function CodeBlockSubstance({ lang, children }: { lang: string, children: ReactNode }): JSX.Element {
  // return alternative element
  //   in order to fix "CodeBlock string is be [object Object] if searched"
  // see: https://github.com/weseek/growi/pull/7484
  //
  // Note: You can also remove this code if the user requests to see the code highlighted in Prism as-is.
  const isSimpleString = Array.isArray(children) && children.length === 1 && typeof children[0] === 'string';
  if (!isSimpleString) {
    return (
      <div className="code-highlighted" style={oneDark['pre[class*="language-"]']}>
        <code className={`language-${lang}`} style={oneDark['code[class*="language-"]']}>
          {children}
        </code>
      </div>
    );
  }

  return (
    <PrismAsyncLight
      className="code-highlighted"
      PreTag="div"
      style={oneDark}
      language={lang}
    >
      {extractChildrenToIgnoreReactNode(children)}
    </PrismAsyncLight>
  );
}

export const CodeBlock: CodeComponent = ({ inline, className, children }) => {

  if (inline) {
    return <code className={`code-inline ${className ?? ''}`}>{children}</code>;
  }

  // TODO: set border according to the value of 'customize:highlightJsStyleBorder'

  const match = /language-(\w+)(:?.+)?/.exec(className || '');
  const lang = match && match[1] ? match[1] : '';
  const name = match && match[2] ? match[2].slice(1) : null;

  return (
    <>
      {name != null && (
        <cite className={`code-highlighted-title ${styles['code-highlighted-title']}`}>{name}</cite>
      )}
      <CodeBlockSubstance lang={lang}>{children}</CodeBlockSubstance>
    </>
  );
};
