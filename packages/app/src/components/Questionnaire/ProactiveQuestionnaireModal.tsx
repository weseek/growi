import { useState, useCallback } from 'react';

import { useTranslation } from 'next-i18next';
import {
  Modal, ModalBody,
} from 'reactstrap';

import { useSiteUrl, useGrowiVersion } from '~/stores/context';

type ModalProps = {
  isOpen: boolean,
  onClose: () => void,
};

const QuestionnaireCompletionModal = (props: ModalProps): JSX.Element => {
  const { t } = useTranslation();

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
            <h2 className="my-4">{t('questionnaire.title')}</h2>
            <p className="mb-1">{t('questionnaire.successfully_submit')}</p>
            <p>{t('questionnaire.thanks_for_answer')}</p>
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
  const { t } = useTranslation();

  const { isOpen, onClose } = props;
  const { data: siteUrl } = useSiteUrl();
  const { data: growiVersion } = useGrowiVersion();

  const [isQuestionnaireCompletionModal, setQuestionnaireCompletionModal] = useState(false);

  const submitHandler = useCallback(async(e) => {
    e.preventDefault();

    const formData = e.target.elements;

    const {
      satisfaction: { value: satisfaction },
      lengthOfExperience: { value: lengthOfExperience },
      position: { value: position },
      occupation: { value: occupation },
      commentText: { value: commentText },
    } = formData;

    const sendValues = {
      satisfaction: Number(satisfaction),
      lengthOfExperience,
      position,
      occupation,
      commentText,
      growiUri: siteUrl,
      growiVersion,
    };

    // TODO: send questionnaire data

    onClose();
    setQuestionnaireCompletionModal(true);
  }, [growiVersion, onClose, siteUrl]);

  return (
    <>
      <Modal
        size="lg"
        isOpen={isOpen}
        toggle={onClose}
        centered
      >
        <ModalBody className="bg-primary overflow-hidden p-0" style={{ borderRadius: 8 }}>
          <div className="bg-white m-2 p-4" style={{ borderRadius: 8 }}>
            <div className="text-center">
              <h2 className="my-4">{t('questionnaire.title')}</h2>
              <p className="mb-1">{t('questionnaire.more_satisfied_services')}</p>
              <p>{t('questionnaire.strive_to_improve_services')}</p>
            </div>
            <form className="px-5" onSubmit={submitHandler}>
              <div className="form-group row mt-5">
                <label className="col-sm-5 col-form-label" htmlFor="satisfaction">
                  <span className="badge badge-primary mr-2">{t('Required')}</span>{t('questionnaire.satisfaction_with_growi')}
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
                <label className="col-sm-5 col-form-label" htmlFor="lengthOfExperience">{t('questionnaire.history_of_growi_use')}</label>
                <select
                  name="lengthOfExperience"
                  id="lengthOfExperience"
                  className="col-sm-7 form-control"
                >
                  <option value="">▼ {t('Select')}</option>
                  <option>{t('questionnaire.length_of_experience.more_than_two_years')}</option>
                  <option>{t('questionnaire.length_of_experience.one_to_two_years')}</option>
                  <option>{t('questionnaire.length_of_experience.six_months_to_one_year')}</option>
                  <option>{t('questionnaire.length_of_experience.three_months_to_six_months')}</option>
                  <option>{t('questionnaire.length_of_experience.one_month_to_three_months')}</option>
                  <option>{t('questionnaire.length_of_experience.less_than_one_month')}</option>
                </select>
              </div>
              <div className="form-group row mt-3">
                <label className="col-sm-5 col-form-label" htmlFor="position">{t('questionnaire.position')}</label>
                <input className="col-sm-7 form-control" type="text" name="position" id="position" />
              </div>
              <div className="form-group row mt-3">
                <label className="col-sm-5 col-form-label" htmlFor="occupation">{t('questionnaire.occupation')}</label>
                <input className="col-sm-7 form-control" type="text" name="occupation" id="occupation" />
              </div>
              <div className="form-group row mt-3">
                <label className="col-sm-5 col-form-label" htmlFor="commentText">{t('questionnaire.comment_on_growi')}</label>
                <textarea className="col-sm-7 form-control" name="commentText" id="commentText" rows={5} />
              </div>
              <div className="text-center mt-5">
                <button type="submit" className="btn btn-primary">{t('questionnaire.answer')}</button>
              </div>
              <div className="text-center my-3">
                <span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={onClose}>{t('Close')}</span>
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
