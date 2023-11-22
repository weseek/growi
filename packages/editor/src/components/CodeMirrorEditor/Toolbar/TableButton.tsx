type TableButtonProps = {
  openTableModal?: () => void;
}

export const TableButton = (props: TableButtonProps): JSX.Element => {
  const { openTableModal } = props;
  const openTableModalHandler = () => {
    if (openTableModal == null) {
      return;
    }
    openTableModal();
  };
  return (
    <button type="button" className="btn btn-toolbar-button" onClick={openTableModalHandler}>
      <span className="material-symbols-outlined fs-5">table_chart</span>
    </button>
  );
};
