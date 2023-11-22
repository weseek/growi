type TableButtonProps = {
  onClickTableBtn: () => void;
}

export const TableButton = (props: TableButtonProps): JSX.Element => {
  const { onClickTableBtn } = props;
  return (
    <button type="button" className="btn btn-toolbar-button" onClick={onClickTableBtn}>
      <span className="material-symbols-outlined fs-5">table_chart</span>
    </button>
  );
};
