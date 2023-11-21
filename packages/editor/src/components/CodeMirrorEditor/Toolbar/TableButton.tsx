type TableButtonProps = {
  openTabelModal?: () => void;
}

export const TableButton = (props: TableButtonProps): JSX.Element => {
  const { openTabelModal } = props;
  const openTabelModalHandler = () => {
    if (openTabelModal == null) {
      return;
    }
    openTabelModal();
  };
  return (
    <button type="button" className="btn btn-toolbar-button" onClick={openTabelModalHandler}>
      <span className="material-symbols-outlined fs-5">table_chart</span>
    </button>
  );
};
