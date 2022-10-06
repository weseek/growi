import React from 'react';

import { useTranslation } from 'next-i18next';
import PropTypes from 'prop-types';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from 'reactstrap';


import { useCurrentPagePath } from '~/stores/context';


const presetA = {
  name: 'presetA',
  value: '## Preset',
};

const presetB = {
  name: 'presetB',
  value: '### Preset',
};

const presetC = {
  name: 'presetC',
  value: '#### Preset',
};

const templates = [presetA, presetB, presetC];

class TemplateModal extends React.PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      show: false,
      markdown: null,
      previewError: '',
      isPreviewOpen: false,
    };

    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
    this.cancel = this.cancel.bind(this);
    this.save = this.save.bind(this);
    this.setMarkdown = this.setMarkdown.bind(this);
  }

  show() {
    this.setState({
      show: true,
    });
  }

  cancel() {
    this.hide();
  }

  hide() {
    this.setState({
      show: false,
    });
  }

  async setMarkdown(markdown) {
    this.setState({
      markdown,
      previewError: null,
    });
  }

  save() {
    const { linkerType } = this.state;

    if (this.props.onSave != null) {
      this.props.onSave(linkerType);
    }

    this.hide();
  }

  element(template) {
    return (
      <div key={template.name} className="custom-control custom-radio">
        <input
          type="radio"
          className="custom-control-input"
          id="string"
          defaultValue={template.value}
          // checked={this.state.linkerType === template.value}
          // onChange={this.handleSelecteLinkerType(template.value)}
        />
        <label className="custom-control-label" htmlFor="string">
          {template.name}
        </label>
      </div>
    );
  }

  renderRadioButtons() {
    return (
      <>
        { templates.map((template) => {
          return (
            this.element(template)
          );
        })}
      </>
    );
  }

  render() {
    const { t } = this.props;

    return (
      <Modal className="link-edit-modal" isOpen={this.state.show} toggle={this.cancel} size="lg" autoFocus={false}>
        <ModalHeader tag="h4" toggle={this.cancel} className="bg-primary text-light">
          Template
        </ModalHeader>

        <ModalBody className="container">
          <div className="row">
            <div className="col-12">
              {this.renderRadioButtons()}
            </div>
          </div>

          {/* <div className={`linkedit-preview ${styles['linkedit-preview']}`}>
            <Preview markdown={this.state.markdown}/>
          </div> */}
        </ModalBody>
        <ModalFooter>
          <button type="button" className="btn btn-sm btn-outline-secondary mx-1" onClick={this.hide}>
            {t('Cancel')}
          </button>
          <button type="submit" className="btn btn-sm btn-primary mx-1" onClick={this.save}>
            {t('Done')}
          </button>
        </ModalFooter>
      </Modal>
    );
  }

}

const TemplateModalFc = React.forwardRef((props, ref) => {
  const { t } = useTranslation();
  const { data: currentPath } = useCurrentPagePath();
  return <TemplateModal t={t} ref={ref} pagePath={currentPath} {...props} />;
});

TemplateModal.propTypes = {
  t: PropTypes.func.isRequired,
  pagePath: PropTypes.string,
  onSave: PropTypes.func,
};


export default TemplateModalFc;
