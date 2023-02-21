import { useState, useCallback } from 'react';

import { useTranslation } from 'next-i18next';
import {
  Modal, ModalBody,
} from 'reactstrap';

import { apiv3Post } from '~/client/util/apiv3-client';

type ModalProps = {
  isOpen: boolean,
  onClose: () => void,
};

const QuestionnaireCompletionModal = (props: ModalProps): JSX.Element => {
  const { t } = useTranslation('commons');

  const { isOpen, onClose } = props;

  return (
    <Modal
      size="lg"
      isOpen={isOpen}
      toggle={onClose}
      centered
    >
      <ModalBody className="bg-primary overflow-hidden p-0" style={{ borderRadius: 8 }}>
        <div className="bg-white m-2 p-4" style={{ borderRadius: 8 }}>
          <div className="text-center">
            <h2 className="my-4">{t('questionnaire_modal.title')}</h2>
            <p className="mb-1">{t('questionnaire_modal.successfully_submitted')}</p>
            <p>{t('questionnaire_modal.thanks_for_answering')}</p>
          </div>
          <div className="text-center my-3">
            <span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={onClose}>{t('Close')}</span>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
};

const ProactiveQuestionnaireModal = (props: ModalProps): JSX.Element => {
  const { t } = useTranslation('commons');

  const { isOpen, onClose } = props;

  const [isQuestionnaireCompletionModal, setQuestionnaireCompletionModal] = useState(false);

  const submitHandler = useCallback(async(e) => {
    e.preventDefault();

    const formData = e.target.elements;

    const {
      satisfaction: { value: satisfaction },
      lengthOfExperience: { value: lengthOfExperience },
      occupation: { value: occupation },
      position: { value: position },
      commentText: { value: commentText },
    } = formData;

    const sendValues = {
      satisfaction: Number(satisfaction),
      lengthOfExperience,
      occupation,
      position,
      commentText,
    };

    apiv3Post('/questionnaire/proactive/answer', sendValues);

    onClose();
    setQuestionnaireCompletionModal(true);
  }, [onClose]);

  return (
    <>
      <Modal
        data-testid="grw-proactive-questionnaire-modal"
        size="lg"
        isOpen={isOpen}
        toggle={onClose}
        centered
      >
        <ModalBody className="bg-primary overflow-hidden p-0" style={{ borderRadius: 8 }}>
          <div className="bg-white m-2 p-4" style={{ borderRadius: 8 }}>
            <div className="text-center">
              <h2 className="my-4">{t('questionnaire_modal.title')}</h2>
              <p className="mb-1">{t('questionnaire_modal.more_satisfied_services')}</p>
              <p>{t('questionnaire_modal.strive_to_improve_services')}</p>
            </div>
            <form className="px-5" onSubmit={submitHandler}>
              <div className="form-group row mt-5">
                <label className="col-sm-5 col-form-label" htmlFor="satisfaction">
                  <span className="badge badge-primary mr-2">{t('questionnaire_modal.required')}</span>{t('questionnaire_modal.satisfaction_with_growi')}
                </label>
                <select className="col-sm-7 form-control" name="satisfaction" id="satisfaction" required>
                  <option value="">▼ {t('Select')}</option>
                  <option>1</option>
                  <option>2</option>
                  <option>3</option>
                  <option>4</option>
                  <option>5</option>
                </select>
              </div>
              <div className="form-group row mt-3">
                <label className="col-sm-5 col-form-label" htmlFor="lengthOfExperience">{t('questionnaire_modal.history_of_growi_usage')}</label>
                <select
                  name="lengthOfExperience"
                  id="lengthOfExperience"
                  className="col-sm-7 form-control"
                >
                  <option value="">▼ {t('Select')}</option>
                  <option>{t('questionnaire_modal.length_of_experience.more_than_two_years')}</option>
                  <option>{t('questionnaire_modal.length_of_experience.one_to_two_years')}</option>
                  <option>{t('questionnaire_modal.length_of_experience.six_months_to_one_year')}</option>
                  <option>{t('questionnaire_modal.length_of_experience.three_months_to_six_months')}</option>
                  <option>{t('questionnaire_modal.length_of_experience.one_month_to_three_months')}</option>
                  <option>{t('questionnaire_modal.length_of_experience.less_than_one_month')}</option>
                </select>
              </div>
              <div className="form-group row mt-3">
                <label className="col-sm-5 col-form-label" htmlFor="occupation">{t('questionnaire_modal.occupation')}</label>
                <input className="col-sm-7 form-control" type="text" name="occupation" id="occupation" />
              </div>
              <div className="form-group row mt-3">
                <label className="col-sm-5 col-form-label" htmlFor="position">{t('questionnaire_modal.position')}</label>
                <input className="col-sm-7 form-control" type="text" name="position" id="position" />
              </div>
              <div className="form-group row mt-3">
                <label className="col-sm-5 col-form-label" htmlFor="commentText">
                  <span className="badge badge-primary mr-2">{t('questionnaire_modal.required')}</span>{t('questionnaire_modal.comment_on_growi')}
                </label>
                <textarea className="col-sm-7 form-control" name="commentText" id="commentText" rows={5} required/>
              </div>
              <div className="text-center mt-5">
                <button type="submit" className="btn btn-primary">{t('questionnaire_modal.submit')}</button>
              </div>
              <div className="text-center my-3">
                <span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={onClose}>{t('questionnaire_modal.close')}</span>
              </div>
            </form>
          </div>
        </ModalBody>
      </Modal>
      <QuestionnaireCompletionModal isOpen={isQuestionnaireCompletionModal} onClose={() => setQuestionnaireCompletionModal(false)} />
    </>
  );
};

export default ProactiveQuestionnaireModal;
