type TableButtonProps = {
  onClickTableBtn: () => void;
}

export const TableButton = (props: TableButtonProps): JSX.Element => {
  const { onClickTableBtn } = props;
  const openTableModalHandler = () => {
    onClickTableBtn();
  };
  return (
    <button type="button" className="btn btn-toolbar-button" onClick={openTableModalHandler}>
      <span className="material-symbols-outlined fs-5">table_chart</span>
    </button>
  );
};
