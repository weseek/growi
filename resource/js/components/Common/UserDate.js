import React from 'react';

import moment from 'moment';

/**
 * UserDate
 *
 * display date depends on user timezone of user settings
 */
export default class UserDate extends React.Component {

  render() {
    const dt = moment(this.props.dateTime).format(this.props.format);

    return (
      <span className={this.props.className}>
        {dt}
      </span>
    );
  }
}

UserDate.propTypes = {
  dateTime: React.PropTypes.string.isRequired,
  format: React.PropTypes.string,
  className: React.PropTypes.string,
};

UserDate.defaultProps = {
  dateTime: 'now',
  format: 'YYYY/MM/DD HH:mm:ss',
  className: '',
};

