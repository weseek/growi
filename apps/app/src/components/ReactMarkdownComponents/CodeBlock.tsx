import type { ReactNode, JSX } from 'react';

import { PrismAsyncLight } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';

import styles from './CodeBlock.module.scss';

// remove font-family
Object.entries<object>(oneDark).forEach(([key, value]) => {
  if ('fontFamily' in value) {
    delete oneDark[key].fontFamily;
  }
});


type InlineCodeBlockProps = {
 children: ReactNode,
 className?: string,
}

export const InlineCodeBlockSubstance = (props: InlineCodeBlockProps): JSX.Element => {
  const { children, className, ...rest } = props;
  return <code className={`code-inline ${className ?? ''}`} {...rest}>{children}</code>;
};


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
  // SIMPLIFIED: Now that this function is only for block-level code,
  // the conditional check for isSimpleString is no longer necessary.

  return (
    <PrismAsyncLight
      PreTag="div"
      style={oneDark}
      language={lang}
    >
      {extractChildrenToIgnoreReactNode(children)}
    </PrismAsyncLight>
  );
}

type CodeBlockProps = {
 children: ReactNode,
 className?: string,
}

export const CodeBlock = (props: CodeBlockProps): JSX.Element => {
  // TODO: set border according to the value of 'customize:highlightJsStyleBorder'
  const { className, children } = props;

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
