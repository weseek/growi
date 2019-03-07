import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';

class SimpleCheatsheet extends React.Component {

  render() {
    const { t } = this.props;

    return (
      <div className="panel panel-default gfm-cheatsheet mb-0">
        <div className="panel-body small p-b-0">
          <div className="row">
            <div className="col-xs-6">
              <p>
                # {t('sandbox.header_x', { index: '1' })}<br />
                ## {t('sandbox.header_x', { index: '2' })}
              </p>
              <p><i>*{t('sandbox.italics')}*</i>&nbsp;&nbsp;<b>**{t('sandbox.bold')}**</b></p>
              <p>
                [{t('sandbox.link')}](http://..)<br />
                [/Page1/ChildPage1]
              </p>
              <p>
                ```javascript:index.js<br />
                writeCode();<br />
                ```
              </p>
            </div>
            <div className="col-xs-6">
              <p>
                - {t('sandbox.unordered_list_x', { index: '1' })}<br />
                &nbsp;&nbsp;&nbsp;- {t('sandbox.unordered_list_x', { index: '1.1' })}<br />
                - {t('sandbox.unordered_list_x', { index: '2' })}<br />
                1. {t('sandbox.ordered_list_x', { index: '1' })}<br />
                1. {t('sandbox.ordered_list_x', { index: '2' })}
              </p>
              <hr />
              <p>[ ][ ] {t('sandbox.block_detail')}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

}

SimpleCheatsheet.propTypes = {
  t: PropTypes.func.isRequired, // i18next
};

export default translate()(SimpleCheatsheet);
