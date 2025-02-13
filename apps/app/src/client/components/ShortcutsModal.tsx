import React from 'react';

import { useTranslation } from 'next-i18next';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';

import { useShortcutsModal } from '~/stores/modal';

import styles from './ShortcutsModal.module.scss';


const ShortcutsModal = (): JSX.Element => {
  const { t } = useTranslation();

  const { data: status, close } = useShortcutsModal();

  const bodyContent = () => {
    if (status == null || !status.isOpened) {
      return <></>;
    }

    // add classes to cmd-key by OS
    const platform = window.navigator.platform.toLowerCase();
    const isMac = (platform.indexOf('mac') > -1);
    const additionalClassByOs = isMac ? 'mac' : 'key-longer win';

    return (
      <div className="container">
        <div className="row">
          <div className="col-lg-6">
            <h6>
              <strong>{t('modal_shortcuts.global.title')}</strong>
            </h6>

            <table className="table">
              <tbody>
                <tr>
                  <th>
                    {/* eslint-disable-next-line react/no-danger */}
                    <span className="text-nowrap" dangerouslySetInnerHTML={{ __html: t('modal_shortcuts.global.Open/Close shortcut help') }} />
                  </th>
                  <td>
                    <span className={`key cmd-key ${additionalClassByOs}`}></span>
                    <span className="text-secondary mx-1">+</span>
                    <span className="key">/</span>
                  </td>
                </tr>
                <tr>
                  <th>{t('modal_shortcuts.global.Create Page')}</th>
                  <td>
                    <span className="key">C</span>
                  </td>
                </tr>
                <tr>
                  <th>{t('modal_shortcuts.global.Edit Page')}</th>
                  <td>
                    <span className="key">E</span>
                  </td>
                </tr>
                <tr>
                  <th>{t('modal_shortcuts.global.Search')}</th>
                  <td>
                    <span className="key">/</span>
                  </td>
                </tr>
                <tr>
                  <th>
                    {/* eslint-disable-next-line react/no-danger */}
                    <span className="text-nowrap" dangerouslySetInnerHTML={{ __html: t('modal_shortcuts.global.Show Contributors') }} />
                  </th>
                  <td className="text-nowrap d-flex justify-content-end">
                    <div className="text-start">
                      <a href={t('modal_shortcuts.global.konami_code_url')} target="_blank" rel="noreferrer">
                        <span className="text-secondary small">
                          {t('modal_shortcuts.global.Konami Code')}
                        </span>
                      </a>
                      <br />
                      <span className="key key-small material-symbols-outlined fs-5 px-0">arrow_upward</span>&nbsp;
                      <span className="key key-small material-symbols-outlined fs-5 px-0">arrow_upward</span>
                      <span className="key key-small material-symbols-outlined fs-5 px-0">arrow_downward</span>&nbsp;
                      <span className="key key-small material-symbols-outlined fs-5 px-0">arrow_downward</span>
                      <br />
                      <span className="key key-small material-symbols-outlined fs-5 px-0">arrow_back</span>&nbsp;
                      <span className="key key-small material-symbols-outlined fs-5 px-0">arrow_forward</span>
                      <span className="key key-small material-symbols-outlined fs-5 px-0">arrow_back</span>&nbsp;
                      <span className="key key-small material-symbols-outlined fs-5 px-0">arrow_forward</span>
                      <br />
                      <span className="key key-small">B</span>&nbsp;<span className="key key-small">A</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <th>{t('modal_shortcuts.global.MirrorMode')}</th>
                  <td className="text-nowrap d-flex justify-content-end">
                    <div className="text-start">
                      <a href={t('modal_shortcuts.global.konami_code_url')} target="_blank" rel="noreferrer">
                        <span className="text-secondary small">
                          {t('modal_shortcuts.global.Konami Code')}
                        </span>
                      </a>
                      <br />
                      <span className="key key-small">X</span>&nbsp;<span className="key key-small">X</span>
                      <span className="key key-small">B</span>&nbsp;<span className="key key-small">B</span>
                      <br />
                      <span className="key key-small">A</span>&nbsp;<span className="key key-small">Y</span>
                      <span className="key key-small">A</span>&nbsp;<span className="key key-small">Y</span>
                      <br />
                      <span className="key key-small material-symbols-outlined fs-5 px-0">arrow_downward</span>&nbsp;
                      <span className="key key-small material-symbols-outlined fs-5 px-0">arrow_back</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="col-lg-6">
            <h6>
              <strong>{t('modal_shortcuts.editor.title')}</strong>
            </h6>
            <table className="table">
              <tbody>
                <tr>
                  <th>{t('modal_shortcuts.editor.Search in Editor')}</th>
                  <td className="text-nowrap">
                    <span className={`key cmd-key ${additionalClassByOs}`}></span>
                    <span className="text-secondary mx-1">+</span>
                    <span className="key">F</span>
                  </td>
                </tr>
                <tr>
                  <th>
                    {t('modal_shortcuts.editor.Save Page')}
                    <span className="small text-secondary ms-1">{t('modal_shortcuts.editor.Only Editor')}</span>
                  </th>
                  <td className="text-nowrap">
                    <span className={`key cmd-key ${additionalClassByOs}`}></span>
                    <span className="text-secondary mx-1">+</span>
                    <span className="key">S</span>
                  </td>
                </tr>
                <tr>
                  <th>{t('modal_shortcuts.editor.Indent')}</th>
                  <td>
                    <span className="key key-longer">Tab</span>
                  </td>
                </tr>
                <tr>
                  <th>{t('modal_shortcuts.editor.Outdent')}</th>
                  <td className="text-nowrap">
                    <span className="key">Shift</span>
                    <span className="text-secondary mx-1">+</span>
                    <span className="key key-longer">Tab</span>
                  </td>
                </tr>
                <tr>
                  <th>{t('modal_shortcuts.editor.Delete Line')}</th>
                  <td className="text-nowrap">
                    <span className={`key cmd-key ${additionalClassByOs}`}></span>
                    <span className="text-secondary mx-1">+</span>
                    <span className="key">Shift</span>
                    <span className="text-secondary mx-1">+</span>
                    <span className="key">K</span>
                  </td>
                </tr>
                <tr>
                  <th>
                    {/* eslint-disable-next-line react/no-danger */}
                    <span dangerouslySetInnerHTML={{ __html: t('modal_shortcuts.editor.Insert Line') }} />
                    <br />
                    <span className="small text-secondary ms-1">{t('modal_shortcuts.editor.Post Comment')}</span>
                  </th>
                  <td className="text-nowrap">
                    <span className={`key cmd-key ${additionalClassByOs}`}></span>
                    <span className="text-secondary mx-1">+</span>
                    <span className="key">Enter</span>
                  </td>
                </tr>
                <tr>
                  <th>{t('modal_shortcuts.editor.Move Line')}</th>
                  <td className="text-nowrap">
                    <span className={`key cmd-key ${additionalClassByOs}`}></span>
                    <span className="text-secondary mx-1">+</span>
                    <span className="key key-small material-symbols-outlined fs-5 px-0">arrow_downward</span>
                    <span className="text-secondary mx-1">or</span>
                    <span className="key key-small material-symbols-outlined fs-5 px-0">arrow_upward</span>
                  </td>
                </tr>
                <tr>
                  <th>{t('modal_shortcuts.editor.Copy Line')}</th>
                  <td className="text-nowrap d-flex justify-content-end">
                    <div className="text-start">
                      <span className={`key cmd-key ${additionalClassByOs}`}></span>
                      <span className="text-secondary mx-1">+</span>
                      <span className="key">Shift</span>
                      <span className="text-secondary mx-1">+</span><br />
                      <span className="key key-small material-symbols-outlined fs-5 px-0">arrow_downward</span>
                      <span className="text-secondary mx-1">or</span>
                      <span className="key key-small material-symbols-outlined fs-5 px-0">arrow_upward</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <th>{t('modal_shortcuts.editor.Toggle Line')}</th>
                  <td className="text-nowrap">
                    <span className={`key cmd-key ${additionalClassByOs}`}></span>
                    <span className="text-secondary mx-1">+</span>
                    <span className="key">/</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      { status != null && (
        <Modal id="shortcuts-modal" size="lg" isOpen={status.isOpened} toggle={close} className={`shortcuts-modal ${styles['shortcuts-modal']}`}>
          <ModalHeader tag="h4" toggle={close} className="px-4">
            {t('Shortcuts')}
          </ModalHeader>
          <ModalBody className="p-4">
            {bodyContent()}
          </ModalBody>
        </Modal>
      ) }
    </>
  );
};

export default ShortcutsModal;
