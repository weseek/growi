type TableButtonProps = {
  openTabelModal: () => void;
}

export const TableButton = (props: TableButtonProps): JSX.Element => {
  const { openTabelModal } = props;
  return (
    <button type="button" className="btn btn-toolbar-button" onClick={openTabelModal}>
      <span className="material-symbols-outlined fs-5">table_chart</span>
    </button>
  );
};
