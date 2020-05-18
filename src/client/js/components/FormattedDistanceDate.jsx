import React from 'react';
import PropTypes from 'prop-types';

import { format, formatDistanceStrict } from 'date-fns';
import { UncontrolledTooltip } from 'reactstrap';

const FormattedDistanceDate = (props) => {

  // cast to date if string
  const date = (typeof props.date === 'string') ? new Date(props.date) : props.date;

  const baseDate = props.baseDate || new Date();

  const elemId = `grw-fdd-${props.id}`;
  const dateFormatted = format(date, 'yyyy/MM/dd HH:mm');

  return (
    <>
      <span id={elemId}>{formatDistanceStrict(date, baseDate)}</span>
      <UncontrolledTooltip placement="bottom" fade={false} target={elemId}>{dateFormatted}</UncontrolledTooltip>
    </>
  );
};

FormattedDistanceDate.propTypes = {
  id: PropTypes.string.isRequired,
  date: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]).isRequired,
  baseDate: PropTypes.instanceOf(Date),
};

export default FormattedDistanceDate;
