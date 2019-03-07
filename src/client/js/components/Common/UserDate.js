import React from 'react';
import PropTypes from 'prop-types';

import dateFnsFormat from 'date-fns/format';

/**
 * UserDate
 *
 * display date depends on user timezone of user settings
 */
export default class UserDate extends React.Component {

  render() {
    const dt = dateFnsFormat(this.props.dateTime, this.props.format);

    return (
      <span className={this.props.className}>
        {dt}
      </span>
    );
  }

}

UserDate.propTypes = {
  dateTime: PropTypes.string.isRequired,
  format: PropTypes.string,
  className: PropTypes.string,
};

UserDate.defaultProps = {
  dateTime: 'now',
  format: 'YYYY/MM/DD HH:mm:ss',
  className: '',
};
