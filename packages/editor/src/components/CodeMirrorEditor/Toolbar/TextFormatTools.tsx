import { memo } from 'react';

import { UncontrolledCollapse } from 'reactstrap';


const TextFormatToolsToggler = memo((): JSX.Element => {
  return (
    <button
      id="btn-text-format-tools"
      type="button"
      className="btn btn-toolbar-button"
      data-bs-toggle="collapse"
      data-bs-target="#collapseTextFormatTools"
      aria-expanded="false"
      aria-controls="collapseTextFormatTools"
    >
      <span className="material-icons text-secondary fs-5">text_increase</span>
    </button>
  );
});

export const TextFormatTools = (): JSX.Element => {
  return (
    <div className="d-flex">
      <TextFormatToolsToggler />

      <UncontrolledCollapse toggler="#btn-text-format-tools" horizontal>
        <div className="d-flex px-1 gap-0" style={{ width: '200px' }}>
          <button type="button" className="btn btn-toolbar-button">
            <span className="material-icons-outlined text-secondary fs-5">format_bold</span>
          </button>
          <button type="button" className="btn btn-toolbar-button">
            <span className="material-icons-outlined text-secondary fs-5">format_italic</span>
          </button>
          <button type="button" className="btn btn-toolbar-button">
            <span className="material-icons-outlined text-secondary fs-5">format_strikethrough</span>
          </button>
          <button type="button" className="btn btn-toolbar-button">
            <span className="material-icons-outlined text-secondary fs-5">block</span>
          </button>
          <button type="button" className="btn btn-toolbar-button">
            <span className="material-icons-outlined text-secondary fs-5">code</span>
          </button>
          <button type="button" className="btn btn-toolbar-button">
            <span className="material-icons-outlined text-secondary fs-5">format_list_bulleted</span>
          </button>
          <button type="button" className="btn btn-toolbar-button">
            <span className="material-icons-outlined text-secondary fs-5">format_list_numbered</span>
          </button>
          <button type="button" className="btn btn-toolbar-button">
            <span className="material-icons-outlined text-secondary fs-5">block</span>
          </button>
          <button type="button" className="btn btn-toolbar-button">
            <span className="material-icons-outlined text-secondary fs-5">checklist</span>
          </button>
        </div>
      </UncontrolledCollapse>
    </div>
  );
};
