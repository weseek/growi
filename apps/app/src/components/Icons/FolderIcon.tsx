import React from 'react';

type Props = {
  isOpen: boolean
}
export const FolderIcon = (props: Props): JSX.Element => {
  const { isOpen } = props;

  return (
    <>
      {!isOpen ? (
        <span className="material-symbols-outlined">folder_open</span>

      ) : (
        <span className="material-symbols-outlined">folder</span>
      )
      }
    </>
  );

};
