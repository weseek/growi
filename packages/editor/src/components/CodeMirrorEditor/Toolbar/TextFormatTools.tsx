import { useCallback, useState } from 'react';

import { Collapse } from 'reactstrap';


type TogglarProps = {
  isOpen: boolean,
  onClick?: () => void,
}

const TextFormatToolsToggler = (props: TogglarProps): JSX.Element => {

  const { onClick } = props;

  // TODO: change color by isOpen

  return (
    <button
      type="button"
      className="btn btn-toolbar-button"
      onClick={onClick}
    >
      <span className="material-icons fs-5">text_increase</span>
    </button>
  );
};

export const TextFormatTools = (): JSX.Element => {
  const [isOpen, setOpen] = useState(false);

  const toggle = useCallback(() => {
    setOpen(bool => !bool);
  }, []);

  return (
    <div className="d-flex">
      <TextFormatToolsToggler isOpen={isOpen} onClick={toggle} />

      <Collapse isOpen={isOpen} horizontal>
        <div className="d-flex px-1 gap-1" style={{ width: '220px' }}>
          <button type="button" className="btn btn-toolbar-button">
            <span className="material-icons-outlined fs-5">format_bold</span>
          </button>
          <button type="button" className="btn btn-toolbar-button">
            <span className="material-icons-outlined fs-5">format_italic</span>
          </button>
          <button type="button" className="btn btn-toolbar-button">
            <span className="material-icons-outlined fs-5">format_strikethrough</span>
          </button>
          <button type="button" className="btn btn-toolbar-button">
            <span className="material-icons-outlined fs-5">block</span>
          </button>
          <button type="button" className="btn btn-toolbar-button">
            <span className="material-icons-outlined fs-5">code</span>
          </button>
          <button type="button" className="btn btn-toolbar-button">
            <span className="material-icons-outlined fs-5">format_list_bulleted</span>
          </button>
          <button type="button" className="btn btn-toolbar-button">
            <span className="material-icons-outlined fs-5">format_list_numbered</span>
          </button>
          <button type="button" className="btn btn-toolbar-button">
            <span className="material-icons-outlined fs-5">block</span>
          </button>
          <button type="button" className="btn btn-toolbar-button">
            <span className="material-icons-outlined fs-5">checklist</span>
          </button>
        </div>
      </Collapse>
    </div>
  );
};
