import React, { FC } from 'react';

type Props = {
  checked: boolean,
  onClickInvoked: () => void,
}

const SelectAllPages: FC<Props> = (props:Props) => {
  const { onClickInvoked, checked } = props;

  // Tood: show checkbox as indeterminate when some pages are checked but not all
  // https://getbootstrap.com/docs/4.5/components/forms/#checkboxes
  return (
    <input
      type="checkbox"
      name="check-delete-all"
      onClick={onClickInvoked}
      checked={checked}
    />
  );
};

export default SelectAllPages;
