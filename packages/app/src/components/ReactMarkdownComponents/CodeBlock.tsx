import { CodeComponent } from 'react-markdown/lib/ast-to-react';
import SyntaxHighlighter, { Prism as PrismSyntaxHighlighter } from 'react-syntax-highlighter';
import {
  github, githubGist, atomOneLight, atomOneDark, xcode, vs, vs2015, hybrid, monokai, tomorrowNight,
} from 'react-syntax-highlighter/dist/cjs/styles/hljs';
import { oneLight } from 'react-syntax-highlighter/dist/cjs/styles/prism';

import styles from './CodeBlock.module.scss';

export const HighlightStyles = {
  /* eslint-disable quote-props, no-multi-spaces */
  'github':         github,
  'github-gist':    githubGist,
  'atom-one-light': atomOneLight,
  'xcode':          xcode,
  'vs':             vs,
  'atom-one-dark':  atomOneDark,
  'hybrid':         hybrid,
  'monokai':        monokai,
  'tomorrow-night': tomorrowNight,
  'vs2015':         vs2015,
  /* eslint-enable quote-props, no-multi-spaces */
};

export const CodeBlock: CodeComponent = ({ inline, className, children }) => {
  if (inline) {
    return <code className={`code-inline ${styles['code-inline']} ${className ?? ''}`}>{children}</code>;
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
      <PrismSyntaxHighlighter
        className="code-highlighted"
        PreTag="div"
        style={oneLight}
        language={lang}
      >
        {String(children).replace(/\n$/, '')}
      </PrismSyntaxHighlighter>
    </>
  );
};

type DemoCodeBlockProps = {
  styleKey:string,
  lang:string,
  children:string,
  classNames: string
}
export const DemoCodeBlock = ({
  styleKey, lang, children, classNames,
}: DemoCodeBlockProps): JSX.Element => {
  return (
    <SyntaxHighlighter
      className={classNames}
      style={HighlightStyles[styleKey]}
      language={lang}
    >
      {children}
    </SyntaxHighlighter>
  );
};
