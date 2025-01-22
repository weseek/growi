import React from 'react';

type Props = {
  isOpen: boolean
}
export const FolderIcon = (props: Props): React.ReactElement => {
  const { isOpen } = props;

  return (
    <>
      {!isOpen ? (
        <span className="material-symbols-outlined">folder</span>

      ) : (
        <span className="material-symbols-outlined">folder_open</span>
      )
      }
    </>
  );

};
