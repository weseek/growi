/* eslint-disable max-len */

import React from 'react';

import { useTranslation } from 'next-i18next';
import { PrismAsyncLight } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';

export const Cheatsheet = (): JSX.Element => {
  const { t } = useTranslation();


  const codeStr = `# ${t('sandbox.header_x', { index: '1' })}\n## ${t('sandbox.header_x', { index: '2' })}\n### ${t('sandbox.header_x', { index: '3' })}`;
  const codeBlockStr = 'text\n\ntext';
  const lineBlockStr = 'text\ntext';
  const typographyStr = `*${t('sandbox.italics')}*\n**${t('sandbox.bold')}**\n***${t('sandbox.italic_bold')}***\n~~${t('sandbox.strikethrough')}~~`;
  const linkStr = '[Google](https://www.google.co.jp/)\n[/Page1/ChildPage1]';
  const codeHighlightStr = '```javascript:index.js\nwriteCode();\n```';

  const codeListStr = `- ${t('sandbox.unordered_list_x', { index: '1' })}
    - ${t('sandbox.unordered_list_x', { index: '1.1' })}
    - ${t('sandbox.unordered_list_x', { index: '1.2' })}`;

  const orderedListStr = `1. ${t('sandbox.ordered_list_x', { index: '1' })}\n1. ${t('sandbox.ordered_list_x', { index: '2' })}`;
  const taskStr = `- [ ] ${t('sandbox.task')}(${t('sandbox.task_unchecked')})\n- [x] ${t('sandbox.task')}(${t('sandbox.task_checked')})`;
  const quoteStr = `> ${t('sandbox.quote1')}\n> ${t('sandbox.quote2')}`;

  const nestedQuoteStr = `>> ${t('sandbox.quote_nested')}\n>>> ${t('sandbox.quote_nested')}\n>>>> ${t('sandbox.quote_nested')}`;

  const tableStr = '|Left       |    Mid    |      Right|\n|:----------|:---------:|----------:|\n|col 1      |   col 2   |      col 3|\n|col 1      |   col 2   |      col 3|';
  const imageStr = '![ex](https://example.com/image.png)';

  // const renderCheetSheetElm = (elm: string) => {
  //   return (

  //   );
  // };


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
          {String(codeStr).replace(/\n$/, '')}
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
          {String(codeBlockStr).replace(/\n$/, '')}
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
          {String(lineBlockStr).replace(/\n$/, '')}
        </PrismAsyncLight>

        {/* Typography */}
        <h4>{t('sandbox.typography')}</h4>
        <PrismAsyncLight
          className="code-highlighted"
          PreTag="div"
          style={oneDark}
          language={'text'}
        >
          {String(typographyStr).replace(/\n$/, '')}
        </PrismAsyncLight>

        {/* Link */}
        <h4>{t('sandbox.link')}</h4>
        <PrismAsyncLight
          className="code-highlighted"
          PreTag="div"
          style={oneDark}
          language={'text'}
        >
          {String(linkStr).replace(/\n$/, '')}
        </PrismAsyncLight>

        {/* CodeHhighlight */}
        <h4>{t('sandbox.code_highlight')}</h4>
        <PrismAsyncLight
          className="code-highlighted"
          PreTag="div"
          style={oneDark}
          language={'text'}
        >
          {String(codeHighlightStr).replace(/\n$/, '')}
        </PrismAsyncLight>
      </div>

      <div className="col-sm-6">
        {/* List */}
        <h4>{t('sandbox.list')}</h4>
        <PrismAsyncLight
          className="code-highlighted"
          PreTag="div"
          style={oneDark}
          language={'text'}
        >
          {String(codeListStr).replace(/\n$/, '')}
        </PrismAsyncLight>

        <PrismAsyncLight
          className="code-highlighted"
          PreTag="div"
          style={oneDark}
          language={'text'}
        >
          {String(orderedListStr).replace(/\n$/, '')}
        </PrismAsyncLight>

        <PrismAsyncLight
          className="code-highlighted"
          PreTag="div"
          style={oneDark}
          language={'text'}
        >
          {String(taskStr).replace(/\n$/, '')}
        </PrismAsyncLight>

        {/* Quote */}
        <h4>{t('sandbox.quote')}</h4>
        <PrismAsyncLight
          className="code-highlighted"
          PreTag="div"
          style={oneDark}
          language={'text'}
        >
          {String(quoteStr).replace(/\n$/, '')}
        </PrismAsyncLight>

        <PrismAsyncLight
          className="code-highlighted"
          PreTag="div"
          style={oneDark}
          language={'text'}
        >
          {String(nestedQuoteStr).replace(/\n$/, '')}
        </PrismAsyncLight>


        {/* Table */}
        <h4>{t('sandbox.table')}</h4>
        <PrismAsyncLight
          className="code-highlighted"
          PreTag="div"
          style={oneDark}
          language={'text'}
        >
          {String(tableStr).replace(/\n$/, '')}
        </PrismAsyncLight>

        {/* Image */}
        <h4>{t('sandbox.image')}</h4>
        <p className="mb-1"><code> ![{t('sandbox.alt_text')}](URL)</code> {t('sandbox.insert_image')}</p>
        <PrismAsyncLight
          className="code-highlighted"
          PreTag="div"
          style={oneDark}
          language={'text'}
        >
          {String(imageStr).replace(/\n$/, '')}
        </PrismAsyncLight>

        <hr />
        <a href="/Sandbox" className="btn btn-info btn-block" target="_blank">
          <i className="icon-share-alt" /> {t('sandbox.open_sandbox')}
        </a>
      </div>
    </div>
  );

};
