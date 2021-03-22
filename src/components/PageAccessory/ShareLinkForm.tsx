import { VFC, useState } from 'react';
import { format as dateFnsFormat, parse as dateFnsParse } from 'date-fns';

import { isInteger } from 'core-js/fn/number';

import { toastSuccess, toastError } from '~/client/js/util/apiNotification';

import { apiv3Post } from '~/utils/apiv3-client';
import { useTranslation } from '~/i18n';
import { useCurrentPageSWR, useCurrentPageShareLinks } from '~/stores/page';

const ExpirationType = {
  UNLIMITED: 'unlimited',
  NUMBER_OF_DAYS: 'numberOfDays',
  CUSTOM: 'custom',
} as const;
type ExpirationType = typeof ExpirationType[keyof typeof ExpirationType];

type Props = {
  onCloseForm: () => void,
};

export const ShareLinkForm:VFC<Props> = (props: Props) => {
  const { t } = useTranslation();
  const { data: currentPage } = useCurrentPageSWR();
  const { mutate: mutateShareLinks } = useCurrentPageShareLinks();


  const [expirationType, setExpirationType] = useState<ExpirationType>(ExpirationType.UNLIMITED);
  const [description, setDescription] = useState('');
  const [numberOfDays, setNumberOfDays] = useState(7);
  const [customExpirationDate, setCustomExpirationDate] = useState(dateFnsFormat(new Date(), 'yyyy-MM-dd'));
  const [customExpirationTime, setCustomExpirationTime] = useState(dateFnsFormat(new Date(), 'HH:mm'));

  if (currentPage == null) {
    return null;
  }

  const closeForm = () => {
    if (props.onCloseForm != null) {
      props.onCloseForm();
    }
  };

  /**
   * Generate expiredAt by expirationType
   */
  const generateExpired = () => {
    let expiredAt;

    if (expirationType === ExpirationType.UNLIMITED) {
      return null;
    }

    if (expirationType === ExpirationType.NUMBER_OF_DAYS) {
      if (!isInteger(Number(numberOfDays))) {
        throw new Error(t('share_links.Invalid_Number_of_Date'));
      }
      const date = new Date();
      date.setDate(date.getDate() + Number(numberOfDays));
      expiredAt = date;
    }

    if (expirationType === ExpirationType.CUSTOM) {
      expiredAt = dateFnsParse(`${customExpirationDate}T${customExpirationTime}`, "yyyy-MM-dd'T'HH:mm", new Date());
    }

    return expiredAt;
  };


  const handleIssueShareLink = async() => {
    let expiredAt;

    try {
      expiredAt = generateExpired();
    }
    catch (err) {
      return toastError(err);
    }

    try {
      await apiv3Post('/share-links/', { relatedPage: currentPage._id, expiredAt, description });
      mutateShareLinks();
      closeForm();
      toastSuccess(t('toaster.issue_share_link'));
    }
    catch (err) {
      toastError(err);
    }

  };

  return (
    <div className="share-link-form p-3">
      <h3 className="grw-modal-head pb-2"> { t('share_links.share_settings') }</h3>
      <div className=" p-3">
        <div className="form-group row">
          <label htmlFor="inputDesc" className="col-md-5 text-right">{t('share_links.expire')}</label>
          <div className="col-md-7">
            <div className="custom-control custom-radio form-group ">
              <input
                type="radio"
                className="custom-control-input"
                id="customRadio1"
                name="expirationType"
                value="customRadio1"
                checked={expirationType === ExpirationType.UNLIMITED}
                onChange={() => { setExpirationType(ExpirationType.UNLIMITED) }}
              />
              <label className="custom-control-label" htmlFor="customRadio1">{t('share_links.Unlimited')}</label>
            </div>

            <div className="custom-control custom-radio  form-group">
              <input
                type="radio"
                className="custom-control-input"
                id="customRadio2"
                value="customRadio2"
                checked={expirationType === ExpirationType.NUMBER_OF_DAYS}
                onChange={() => { setExpirationType(ExpirationType.NUMBER_OF_DAYS) }}
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
                    onFocus={() => { setExpirationType(ExpirationType.NUMBER_OF_DAYS) }}
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
                checked={expirationType === ExpirationType.CUSTOM}
                onChange={() => { setExpirationType(ExpirationType.CUSTOM) }}
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
                  onFocus={() => { setExpirationType(ExpirationType.CUSTOM) }}
                  onChange={e => setCustomExpirationDate(e.target.value)}
                />
                <input
                  type="time"
                  className="ml-3 mb-2"
                  name="customExpiration"
                  value={customExpirationTime}
                  onFocus={() => { setExpirationType(ExpirationType.CUSTOM) }}
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
        <button type="button" className="btn btn-primary d-block mx-auto px-5" onClick={handleIssueShareLink}>
          {t('share_links.Issue')}
        </button>
      </div>
    </div>
  );
};
