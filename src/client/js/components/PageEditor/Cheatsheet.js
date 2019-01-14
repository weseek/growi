import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';

class Cheatsheet extends React.Component {
  render() {
    const { t } = this.props;

    return (
      <div className="row small">
        <div className="col-sm-6">
          <h4>{t('sandbox.header')}</h4>
          <ul className="hljs">
            <li><code># </code>{t('sandbox.header', {index: '1'})}</li>
            <li><code>## </code>{t('sandbox.header', {index: '2'})}</li>
            <li><code>### </code>{t('sandbox.header', {index: '3'})}</li>
          </ul>
          <h4>{t('sandbox.block')}</h4>
          <p className="mb-1"><code>[{t('sandbox.empty_line')}]</code>{t('sandbox.block_detail')}</p>
          <ul className="hljs">
            <li>text</li>
            <li></li>
            <li>text</li>
          </ul>
          <h4>{t('sandbox.line_break')}</h4>
          <p className="mb-1"><code>[ ][ ]</code> {t('sandbox.line_break_detail')}</p>
          <ul className="hljs">
            <li>text</li>
            <li>text</li>
          </ul>
          <h4>{t('sandbox.typography')}</h4>
          <ul className="hljs">
            <li><i>*{t('sandbox.italics')}*</i></li>
            <li><b>**{t('sandbox.bold')}**</b></li>
            <li><i><b>***{t('sandbox.italic_bold')}***</b></i></li>
            <li>~~{t('sandbox.strikethrough')}~~ => <s>{t('sandbox.strikethrough')}</s></li>
          </ul>
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
          <h4>{t('sandbox.list')}</h4>
          <ul className="hljs">
            <li>- {t('sandbox.unordered_list', {index: '1'})}</li>
            <li>&nbsp;&nbsp;- {t('sandbox.unordered_list', {index: '1_1'})}</li>
            <li>- {t('sandbox.unordered_list', {index: '2'})}</li>
          </ul>
          <ul className="hljs">
            <li>1. {t('sandbox.ordered_list', {index: '1'})}</li>
            <li>1. {t('sandbox.ordered_list', {index: '2'})}</li>
          </ul>
          <ul className="hljs">
            <li>- [ ] {t('sandbox.task')}({t('sandbox.task_unchecked')})</li>
            <li>- [x] {t('sandbox.task')}({t('sandbox.task_checked')})</li>
          </ul>
          <h4>{t('sandbox.quote')}</h4>
          <ul className="hljs">
            <li>> {t('sandbox.quote1')}</li>
            <li>> {t('sandbox.quote2')}</li>
          </ul>
          <ul className="hljs">
            <li>>> {t('sandbox.quote_nested')}</li>
            <li>>>> {t('sandbox.quote_nested')}</li>
            <li>>>>> {t('sandbox.quote_nested')}</li>
          </ul>
          <h4>{t('sandbox.table')}</h4>
          <ul className="hljs text-center">
            <li>|Left&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;Mid&nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Right|</li>
            <li>|:----------|:---------:|----------:|</li>
            <li>|col 1&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;col 2&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;col 3|</li>
            <li>|col 1&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;col 2&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;col 3|</li>
          </ul>
          <h4>{t('sandbox.image')}</h4>
          <p className="mb-1"><code> ![{t('sandbox.alt_text')}](URL)</code> {t('sandbox.insert_image')}</p>
          <ul className="hljs">
            <li>![ex](https://example.com/image.png)</li>
          </ul>

          <hr />
          <a href="/Sandbox" className="btn btn-info btn-block" target="_blank">
            <i className="icon-share-alt"/> {t('sandbox.open_sandbox')}
          </a>
        </div>
      </div>
    );
  }
}

Cheatsheet.propTypes = {
  t: PropTypes.func.isRequired,               // i18next
};

export default translate()(Cheatsheet);
