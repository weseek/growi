/* eslint-disable max-len */

import React from 'react';

import { useTranslation } from 'next-i18next';
import PropTypes from 'prop-types';
import { PrismAsyncLight } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';

class Cheatsheet extends React.Component {

  render() {
    const { t } = this.props;

    // const match = /language-(\w+)(:?.+)?/.exec(className || '');
    // const lang = match && match[1] ? match[1] : '';

    // const codeStr = `# ${t('sandbox.header_x', { index: '1' })}
    // ## ${t('sandbox.header_x', { index: '2' })}
    // ### ${t('sandbox.header_x', { index: '3' })}`;

    const codeStr = `# ${t('sandbox.header_x', { index: '1' })}\n## ${t('sandbox.header_x', { index: '2' })}\n### ${t('sandbox.header_x', { index: '3' })}`;

    const codeList = `- ${t('sandbox.unordered_list_x', { index: '1' })}
    - ${t('sandbox.unordered_list_x', { index: '1.1' })}
    - ${t('sandbox.unordered_list_x', { index: '2' })}`;

    const codeBlock = 'text\n\ntext';
    const lineBlock = 'text\ntext';
    const typography = `*{t('sandbox.italics')}*\n**{t('sandbox.bold')}**\n
    ***{t('sandbox.italic_bold')}***\n
    ~~{t('sandbox.strikethrough')}~~ {t('sandbox.strikethrough')}`;


    return (
      <div className="row small">
        <div className="col-sm-6">
          {/* Header */}
          <h4>{t('sandbox.header')}</h4>
          <PrismAsyncLight
            className="code-highlighted"
            PreTag="div"
            style={oneDark}
            language={'text'}
          >
            {codeStr}
          </PrismAsyncLight>

          {/* Block */}
          <h4>{t('sandbox.block')}</h4>
          <p className="mb-1"><code>[{t('sandbox.empty_line')}]</code>{t('sandbox.block_detail')}</p>
          <PrismAsyncLight
            className="code-highlighted"
            PreTag="div"
            style={oneDark}
            language={'text'}
          >
            {String(codeBlock).replace(/\n$/, '')}
          </PrismAsyncLight>

          {/* Line Break */}
          <h4>{t('sandbox.line_break')}</h4>
          <p className="mb-1"><code>[ ][ ]</code> {t('sandbox.line_break_detail')}</p>
          <PrismAsyncLight
            className="code-highlighted"
            PreTag="div"
            style={oneDark}
            language={'text'}
          >
            {String(lineBlock).replace(/\n$/, '')}
          </PrismAsyncLight>

          {/* Typography */}
          <h4>{t('sandbox.typography')}</h4>
          <PrismAsyncLight
            className="code-highlighted"
            PreTag="div"
            style={oneDark}
            language={'text'}
          >
            {String(typography).replace(/\n$/, '')}
          </PrismAsyncLight>
          {/* <ul className="hljs">
            <li><i>*{t('sandbox.italics')}*</i></li>
            <li><b>**{t('sandbox.bold')}**</b></li>
            <li><i><b>***{t('sandbox.italic_bold')}***</b></i></li>
            <li>~~{t('sandbox.strikethrough')}~~ =&lt; <s>{t('sandbox.strikethrough')}</s></li>
          </ul> */}

          {/* Link */}
          <h4>{t('sandbox.link')}</h4>
          <ul className="hljs">
            <li>[Google](https://www.google.co.jp/)</li>
            <li>[/Page1/ChildPage1]</li>
          </ul>
          <h4>{t('sandbox.code_highlight')}</h4>
          <ul className="hljs">
            <li>```javascript:index.js</li>
            <li>writeCode();</li>
            <li>```</li>
          </ul>
        </div>

        <div className="col-sm-6">
          {/* List */}
          <h4>{t('sandbox.list')}</h4>
          {/* <ul className="hljs"> */}
          <PrismAsyncLight
            className="code-highlighted"
            PreTag="div"
            style={oneDark}
            language={'text'}
          >
            {String(codeList).replace(/\n$/, '')}
          </PrismAsyncLight>
          {/* </ul> */}
          <ul className="hljs">
            <li>1. {t('sandbox.ordered_list_x', { index: '1' })}</li>
            <li>1. {t('sandbox.ordered_list_x', { index: '2' })}</li>
          </ul>
          <ul className="hljs">
            <li>- [ ] {t('sandbox.task')}({t('sandbox.task_unchecked')})</li>
            <li>- [x] {t('sandbox.task')}({t('sandbox.task_checked')})</li>
          </ul>

          {/* Quote */}
          <h4>{t('sandbox.quote')}</h4>
          <ul className="hljs">
            <li>&gt; {t('sandbox.quote1')}</li>
            <li>&gt; {t('sandbox.quote2')}</li>
          </ul>
          <ul className="hljs">
            <li>&gt;&gt; {t('sandbox.quote_nested')}</li>
            <li>&gt;&gt;&gt; {t('sandbox.quote_nested')}</li>
            <li>&gt;&gt;&gt;&gt; {t('sandbox.quote_nested')}</li>
          </ul>

          {/* Table */}
          <h4>{t('sandbox.table')}</h4>
          <pre className="border-0">
            |Left&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;Mid&nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Right|<br />
            |:----------|:---------:|----------:|<br />
            |col 1&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;col 2&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;col 3|<br />
            |col 1&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;col 2&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;col 3|<br />
          </pre>

          {/* Image */}
          <h4>{t('sandbox.image')}</h4>
          <p className="mb-1"><code> ![{t('sandbox.alt_text')}](URL)</code> {t('sandbox.insert_image')}</p>
          <ul className="hljs">
            <li>![ex](https://example.com/image.png)</li>
          </ul>

          <hr />
          <a href="/Sandbox" className="btn btn-info btn-block" target="_blank">
            <i className="icon-share-alt" /> {t('sandbox.open_sandbox')}
          </a>
        </div>
      </div>
    );
  }

}

Cheatsheet.propTypes = {
  t: PropTypes.func.isRequired, // i18next
};

const CheatsheetWrapperFC = (props) => {
  const { t } = useTranslation();
  return <Cheatsheet t={t} {...props} />;
};

export default CheatsheetWrapperFC;
