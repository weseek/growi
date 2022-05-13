import React, { FC } from 'react';

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';


type DateRangePickerProps = {
  startDate: Date
  setStartDate: (date: Date) => void
}

export const DateRangePicker: FC<DateRangePickerProps> = (props: DateRangePickerProps) => {

  return (
    <DatePicker
      selected={props.startDate}
      onChange={(date: Date) => props.setStartDate(date)}
    />
  );
};
