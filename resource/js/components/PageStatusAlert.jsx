import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';

/**
 *
 * @author Yuki Takei <yuki@weseek.co.jp>
 *
 * @export
 * @class PageStatusAlert
 * @extends {React.Component}
 */

class PageStatusAlert extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      revisionId: this.props.revisionId,
      latestRevisionId: this.props.revisionId,
      lastUpdateUsername: undefined,
    };
  }

  initRevisionId(revisionId) {
    this.setState({
      revisionId,
      latestRevisionId: revisionId,
    });
  }

  setLatestRevisionId(revisionId) {
    this.setState({latestRevisionId: revisionId});
  }

  setLastUpdateUsername(lastUpdateUsername) {
    this.setState({lastUpdateUsername});
  }

  render() {
    const { t } = this.props;
    const label1 = t('edited this page');
    const label2 = t('Load latest');

    const isShown = this.state.revisionId !== this.state.latestRevisionId;
    const style = {
      display: isShown ? 'block' : 'none'
    };

    return (
      <div className="myadmin-alert alert-warning myadmin-alert-bottom alertbottom2" style={style}>
        <i className="icon-fw icon-bulb"></i>
        <span>{this.state.lastUpdateUsername}</span> {label1}&nbsp;
        <a href="javascript:location.reload();">
          <i className="fa fa-angle-double-right"></i> {label2}
        </a>
      </div>
    );
  }
}

PageStatusAlert.propTypes = {
  t: PropTypes.func.isRequired,               // i18next
  crowi: PropTypes.object.isRequired,
  revisionId: PropTypes.string,
  latestRevisionId: PropTypes.string,
};

PageStatusAlert.defaultProps = {
};

export default translate()(PageStatusAlert);
