import React, { FC, useRef, forwardRef } from 'react';

import { ja, enUS, zhCN } from 'date-fns/locale';
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import { useCurrentUser } from '~/stores/context';


type CustomInputProps = {
  buttonRef: React.Ref<HTMLButtonElement>
  onClick?: () => void;
}

const CustomInput = forwardRef<HTMLButtonElement, CustomInputProps>((props: CustomInputProps) => {
  return (
    <button
      type="button"
      className="btn btn-outline-secondary dropdown-toggle"
      ref={props.buttonRef}
      onClick={props.onClick}
    >
      <i className="fa fa-fw fa-calendar" /> Date
    </button>
  );
});


const DateFnslocal = {
  ja_JP: ['ja', ja],
  en_US: ['enUS', enUS],
  zh_CN: ['zhCN', zhCN],
} as const;

type DateRangePickerProps = {
  startDate: Date | null
  endDate: Date | null
  onChangeDate: (dateList: Date[] | null[]) => void
}

export const DateRangePicker: FC<DateRangePickerProps> = (props: DateRangePickerProps) => {
  const { startDate, endDate } = props;

  const { data: currentUser } = useCurrentUser();
  const currentUserLang = currentUser != null ? currentUser.lang : 'en_US';
  const dateFnslocal = DateFnslocal[currentUserLang];
  registerLocale(dateFnslocal[0], dateFnslocal[1]);

  const buttonRef = useRef(null);

  return (
    <div className="btn-group mr-2 mb-3">
      <DatePicker
        locale={dateFnslocal[0]}
        selectsRange
        startDate={startDate}
        endDate={endDate}
        onChange={props.onChangeDate}
        customInput={<CustomInput buttonRef={buttonRef} />}
      />
    </div>
  );
};
