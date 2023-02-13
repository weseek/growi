import React from 'react';

import { format } from 'date-fns';
import PropTypes from 'prop-types';


/**
 * UserDate
 *
 * display date depends on user timezone of user settings
 */
export default class UserDate extends React.Component {

  render() {
    const date = new Date(this.props.dateTime);
    const dt = format(date, this.props.format);

    return (
      <span className={this.props.className} data-hide-in-vrt>
        {dt}
      </span>
    );
  }

}

UserDate.propTypes = {
  dateTime: PropTypes.instanceOf(Date).isRequired,
  format: PropTypes.string,
  className: PropTypes.string,
};

UserDate.defaultProps = {
  format: 'yyyy/MM/dd HH:mm:ss',
  className: '',
};
