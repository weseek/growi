
import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { Modal, ModalHeader, ModalBody } from 'reactstrap';

import { withTranslation } from 'react-i18next';

import KeyboardReturnEnterIcon from './Icons/KeyboardReturnEnterIcon';


const ShortcutsModal = (props) => {
  const { t } = props;

  const [isOpen, setIsOpen] = useState(false);

  // add classes to cmd-key by OS
  const platform = window.navigator.platform.toLowerCase();
  const isMac = (platform.indexOf('mac') > -1);
  const additionalClassByOs = 'key-longer win';

  function toggleIsOpen() {
    setIsOpen(!isOpen);
  }

  return (
    <>
      <Modal id="shortcuts-modal" size="lg" isOpen={isOpen} toggle={toggleIsOpen} className="grw-create-page">
        <ModalHeader tag="h4" toggle={toggleIsOpen} className="bg-primary text-light">
          {t('Shortcuts')}
        </ModalHeader>
        <ModalBody>
          <div className="container">
            <div className="row">
              <div className="col-lg-6">
                <h3>
                  <strong>{t('modal_shortcuts.global.title')}</strong>
                </h3>

                <table className="table">
                  <tr>
                    <th>
                      {/* eslint-disable-next-line react/no-danger */}
                      <span dangerouslySetInnerHTML={{ __html: t('modal_shortcuts.global.Open/Close shortcut help') }} />:
                    </th>
                    <td>
                      <span className={`key cmd-key ${additionalClassByOs}`}></span> + <span className="key">/</span>
                    </td>
                  </tr>
                  <tr>
                    <th>{t('modal_shortcuts.global.Create Page')}:</th>
                    <td>
                      <span className="key">C</span>
                    </td>
                  </tr>
                  <tr>
                    <th>{t('modal_shortcuts.global.Edit Page')}:</th>
                    <td>
                      <span className="key">E</span>
                    </td>
                  </tr>
                  <tr>
                    <th>
                      {/* eslint-disable-next-line react/no-danger */}
                      <span dangerouslySetInnerHTML={{ __html: t('modal_shortcuts.global.Show Contributors') }} />:
                    </th>
                    <td>
                      <a href="{ t('modal_shortcuts.global.konami_code_url') }" target="_blank">
                        {t('modal_shortcuts.global.Konami Code')}
                      </a>
                      <br />
                      <span className="key key-small">↑</span>&nbsp;<span className="key key-small">↑</span>
                      <span className="key key-small">↓</span>&nbsp;<span className="key key-small">↓</span>
                      <span className="key key-small">←</span>
                      <br />
                      <span className="key key-small">→</span>
                      <span className="key key-small">←</span>&nbsp;<span className="key key-small">→</span>
                      <span className="key key-small">B</span>&nbsp;<span className="key key-small">A</span>
                    </td>
                  </tr>
                  <tr>
                    <th>{t('modal_shortcuts.global.MirrorMode')}:</th>
                    <td>
                      <a href="{ t('modal_shortcuts.global.konami_code_url') }" target="_blank">
                        {t('modal_shortcuts.global.Konami Code')}
                      </a>
                      <br />
                      <span className="key key-small">X</span>&nbsp;<span className="key key-small">X</span>
                      <span className="key key-small">B</span>&nbsp;<span className="key key-small">B</span>
                      <span className="key key-small">A</span>
                      <br />
                      <span className="key key-small">Y</span>
                      <span className="key key-small">A</span>&nbsp;<span className="key key-small">Y</span>
                      <span className="key key-small">↓</span>&nbsp;<span className="key key-small">←</span>
                    </td>
                  </tr>
                </table>
              </div>

              <div className="col-lg-6">
                <h3>
                  <strong>{t('modal_shortcuts.editor.title')}</strong>
                </h3>
                <table className="table">
                  <tr>
                    <th>{t('modal_shortcuts.editor.Indent')}:</th>
                    <td>
                      <span className="key key-longer">Tab</span>
                    </td>
                  </tr>
                  <tr>
                    <th>{t('modal_shortcuts.editor.Outdent')}:</th>
                    <td className="text-nowrap">
                      <span className="key key-long">Shift</span> + <span className="key key-longer">Tab</span>
                    </td>
                  </tr>
                  <tr>
                    <th>{t('modal_shortcuts.editor.Save Page')}:</th>
                    <td>
                      <span className={`key cmd-key ${additionalClassByOs}`}></span> + <span className="key">S</span>
                    </td>
                  </tr>
                  <tr>
                    <th>{t('modal_shortcuts.editor.Delete Line')}:</th>
                    <td>
                      <span className={`key cmd-key ${additionalClassByOs}`}></span> + <span className="key">D</span>
                    </td>
                  </tr>
                </table>

                <h3>
                  <strong>{t('modal_shortcuts.commentform.title')}</strong>
                </h3>

                <table className="table">
                  <tr>
                    <th>{t('modal_shortcuts.commentform.Post')}:</th>
                    <td>
                      <span className={`key cmd-key ${additionalClassByOs}`}></span> +
                      <span className="key key-longer">
                        <KeyboardReturnEnterIcon />
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <th>{t('modal_shortcuts.editor.Delete Line')}:</th>
                    <td>
                      <span className={`key cmd-key ${additionalClassByOs}`}></span> + <span className="key">D</span>
                    </td>
                  </tr>
                </table>
              </div>
            </div>
          </div>
        </ModalBody>
      </Modal>
      <button type="button" className="btn btn-link p-0" onClick={e => toggleIsOpen()}>
        <i className="fa fa-keyboard-o"></i>&nbsp;<span className={`cmd-key ${additionalClassByOs}`}></span>-/
      </button>
    </>
  );
};

ShortcutsModal.propTypes = {
  t: PropTypes.func.isRequired, //  i18next
};

export default withTranslation()(ShortcutsModal);
