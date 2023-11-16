import { useHandsontableModal } from '../../../stores/use-handosontable';

export const TableButton = (): JSX.Element => {
  const { open: openHandsontableModal } = useHandsontableModal();

  const openModalHandler = () => {
    openHandsontableModal();
  };
  return (
    <button type="button" className="btn btn-toolbar-button" onClick={openModalHandler}>
      <span className="material-symbols-outlined fs-5">table_chart</span>
    </button>
  );
};
