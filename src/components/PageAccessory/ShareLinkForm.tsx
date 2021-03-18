import { VFC, useState } from 'react';
import { format as dateFnsFormat, parse as dateFnsParse } from 'date-fns';

import { isInteger } from 'core-js/fn/number';

import { toastSuccess, toastError } from '../../client/js/util/apiNotification';

import { apiv3Post } from '../../client/js/util/apiv3-client';

import { useTranslation } from '~/i18n';

type Props = {
  onCloseForm: () => void,
};

export const ShareLinkForm:VFC<Props> = (props: Props) => {
  const { t } = useTranslation();

  const [expirationType, setExpirationType] = useState('');
  const [description, setDescription] = useState('');
  const [numberOfDays, setNumberOfDays] = useState(7);
  const [customExpirationDate, setCustomExpirationDate] = useState(dateFnsFormat(new Date(), 'yyyy-MM-dd'));
  const [customExpirationTime, setCustomExpirationTime] = useState(dateFnsFormat(new Date(), 'HH:mm'));

  const closeForm = () => {
    if (props.onCloseForm != null) {
      props.onCloseForm();
    }
  };

  return (
    <div className="share-link-form p-3">
      <h3 className="grw-modal-head pb-2"> { t('share_links.share_settings') }</h3>
      <div className=" p-3">
        <div className="form-group row">
          <label htmlFor="inputDesc" className="col-md-5 col-form-label">{t('share_links.expire')}</label>
          <div className="col-md-7">
            <div className="custom-control custom-radio form-group ">
              <input
                type="radio"
                className="custom-control-input"
                id="customRadio1"
                name="expirationType"
                value="customRadio1"
                checked={expirationType === 'unlimited'}
                onChange={() => { setExpirationType('unlimited') }}
              />
              <label className="custom-control-label" htmlFor="customRadio1">{t('share_links.Unlimited')}</label>
            </div>

            <div className="custom-control custom-radio  form-group">
              <input
                type="radio"
                className="custom-control-input"
                id="customRadio2"
                value="customRadio2"
                checked={expirationType === 'numberOfDays'}
                onChange={() => { setExpirationType('numberOfDays') }}
                name="expirationType"
              />
              <label className="custom-control-label" htmlFor="customRadio2">
                <div className="row align-items-center m-0">
                  <input
                    type="number"
                    min="1"
                    className="col-4"
                    name="expirationType"
                    value={numberOfDays}
                    onFocus={() => { setExpirationType('numberOfDays') }}
                    onChange={e => setNumberOfDays(Number(e.target.value))}
                  />
                  <span className="col-auto">{t('share_links.Days')}</span>
                </div>
              </label>
            </div>

            <div className="custom-control custom-radio form-group text-nowrap mb-0">
              <input
                type="radio"
                className="custom-control-input"
                id="customRadio3"
                name="expirationType"
                value="customRadio3"
                checked={expirationType === 'custom'}
                onChange={() => { setExpirationType('custom') }}
              />
              <label className="custom-control-label" htmlFor="customRadio3">
                {t('share_links.Custom')}
              </label>
              <div className="d-inline-flex flex-wrap">
                <input
                  type="date"
                  className="ml-3 mb-2"
                  name="customExpirationDate"
                  value={customExpirationDate}
                  onFocus={() => { setExpirationType('custom') }}
                  onChange={e => setCustomExpirationDate(e.target.value)}
                />
                <input
                  type="time"
                  className="ml-3 mb-2"
                  name="customExpiration"
                  value={customExpirationTime}
                  onFocus={() => { setExpirationType('custom') }}
                  onChange={e => setCustomExpirationTime(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="form-group row">
          <label htmlFor="inputDesc" className="col-md-5 col-form-label">{t('share_links.description')}</label>
          <div className="col-md-4">
            <input
              type="text"
              className="form-control"
              id="inputDesc"
              placeholder={t('share_links.enter_desc')}
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>
        </div>
        {/* <button type="button" className="btn btn-primary d-block mx-auto px-5" onClick={handleIssueShareLink}>
          {t('share_links.Issue')}
        </button> */}
      </div>
    </div>
  );
};

//   /**
//    * Generate expiredAt by expirationType
//    */
//   generateExpired() {
//     const { t } = props;
//     const { expirationType } = state;
//     let expiredAt;

//     if (expirationType === 'unlimited') {
//       return null;
//     }

//     if (expirationType === 'numberOfDays') {
//       if (!isInteger(Number(numberOfDays))) {
//         throw new Error(t('share_links.Invalid_Number_of_Date'));
//       }
//       const date = new Date();
//       date.setDate(date.getDate() + Number(numberOfDays));
//       expiredAt = date;
//     }

//     if (expirationType === 'custom') {
//       const { customExpirationDate, customExpirationTime } = state;
//       expiredAt = dateFnsParse(`${customExpirationDate}T${customExpirationTime}`, "yyyy-MM-dd'T'HH:mm", new Date());
//     }

//     return expiredAt;
//   }


//   async handleIssueShareLink() {
//     const {
//       t, pageContainer,
//     } = props;
//     const { pageId } = pageContainer.state;
//     const { description } = state;

//     let expiredAt;

//     try {
//       expiredAt = generateExpired();
//     }
//     catch (err) {
//       return toastError(err);
//     }

//     try {
//       await apiv3Post('/share-links/', { relatedPage: pageId, expiredAt, description });
//       closeForm();
//       toastSuccess(t('toaster.issue_share_link'));
//     }
//     catch (err) {
//       toastError(err);
//     }

//   }
