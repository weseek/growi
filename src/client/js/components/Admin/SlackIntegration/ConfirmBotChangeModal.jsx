import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

const ConfirmBotChangeModal = ({ show, onButtonClick }) => {
  const { t } = useTranslation('admin');
  const dialog = useRef({});
  useEffect(() => {
    $(dialog.current).modal(show ? 'show' : 'hide');
  }, [show]);
  useEffect(() => {
    $(dialog.current).on('hide.bs.modal', () => onButtonClick('close'));
  }, [onButtonClick]);

  return (
    <div className="modal fade" ref={dialog} id="modalDialog" tabIndex="-1" role="dialog" aria-labelledby="modalDialogLabel" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="modalDialogLabel">
              {t('slack_integration.modal.warning')}
            </h5>
            <button type="button" className="close" aria-label="Close" onClick={() => onButtonClick('close')}>
              <span aria-hidden="true">&times;</span>
            </button>
          </div>

          <div className="modal-body">
            <div>
              <h4>{t('slack_integration.modal.sure_change_bot_type')}</h4>
            </div>
            <div>
              <p>{t('slack_integration.modal.changes_will_be_deleted')}</p>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => onButtonClick('close')}>
              {t('slack_integration.modal.cancel')}
            </button>
            <button type="button" className="btn btn-primary" onClick={() => onButtonClick('change')}>
              {t('slack_integration.modal.change')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

ConfirmBotChangeModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onButtonClick: PropTypes.func.isRequired,
};

export default ConfirmBotChangeModal;
