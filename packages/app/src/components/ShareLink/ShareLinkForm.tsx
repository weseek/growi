import React, { FC, useState, useCallback } from 'react';

import { isInteger } from 'core-js/fn/number';
import { format, parse } from 'date-fns';
import { useTranslation } from 'next-i18next';

import { toastSuccess, toastError } from '~/client/util/apiNotification';
import { apiv3Post } from '~/client/util/apiv3-client';
import { useCurrentPageId } from '~/stores/context';

type Props = {
  onCloseForm: () => void,
}

export const ShareLinkForm: FC<Props> = (props: Props) => {
  const { t } = useTranslation();
  const { onCloseForm } = props;

  const [expirationType, setExpirationType] = useState('unlimited');
  const [numberOfDays, setNumberOfDays] = useState(7);
  const [description, setDescription] = useState('');
  const [customExpirationDate, setCustomExpirationDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [customExpirationTime, setCustomExpirationTime] = useState(format(new Date(), 'HH:mm'));

  const { data: currentPageId } = useCurrentPageId();

  const handleChangeExpirationType = useCallback((expirationType) => {
    setExpirationType(expirationType);
  }, []);

  const handleChangeNumberOfDays = useCallback((numberOfDays) => {
    setNumberOfDays(numberOfDays);
  }, []);

  const handleChangeDescription = useCallback((description) => {
    setDescription(description);
  }, []);

  const handleChangeCustomExpirationDate = useCallback((customExpirationDate) => {
    setCustomExpirationDate(customExpirationDate);
  }, []);

  const handleChangeCustomExpirationTime = useCallback((customExpirationTime) => {
    setCustomExpirationTime(customExpirationTime);
  }, []);

  const generateExpired = useCallback(() => {
    let expiredAt;

    if (expirationType === 'unlimited') {
      return null;
    }

    if (expirationType === 'numberOfDays') {
      if (!isInteger(Number(numberOfDays))) {
        throw new Error(t('share_links.Invalid_Number_of_Date'));
      }
      const date = new Date();
      date.setDate(date.getDate() + Number(numberOfDays));
      expiredAt = date;
    }

    if (expirationType === 'custom') {
      expiredAt = parse(`${customExpirationDate}T${customExpirationTime}`, "yyyy-MM-dd'T'HH:mm", new Date());
    }

    return expiredAt;
  }, [t, customExpirationTime, customExpirationDate, expirationType, numberOfDays]);

  const closeForm = useCallback(() => {
    if (onCloseForm == null) {
      return;
    }
    onCloseForm();
  }, [onCloseForm]);

  const handleIssueShareLink = useCallback(async() => {
    let expiredAt;

    try {
      expiredAt = generateExpired();
    }
    catch (err) {
      return toastError(err);
    }

    try {
      await apiv3Post('/share-links/', { relatedPage: currentPageId, expiredAt, description });
      closeForm();
      toastSuccess(t('toaster.issue_share_link'));
    }
    catch (err) {
      toastError(err);
    }
  }, [t, currentPageId, description, closeForm, generateExpired]);

  return (
    <div className="share-link-form p-3">
      <h3 className="grw-modal-head pb-2"> { t('share_links.share_settings') }</h3>
      <div className=" p-3">

        {/* ExpirationTypeOptions */}
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
                onChange={() => { handleChangeExpirationType('unlimited') }}
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
                onChange={() => { handleChangeExpirationType('numberOfDays') }}
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
                    onFocus={() => { handleChangeExpirationType('numberOfDays') }}
                    onChange={e => handleChangeNumberOfDays(Number(e.target.value))}
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
                onChange={() => { handleChangeExpirationType('custom') }}
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
                  onFocus={() => { handleChangeExpirationType('custom') }}
                  onChange={e => handleChangeCustomExpirationDate(e.target.value)}
                />
                <input
                  type="time"
                  className="ml-3 mb-2"
                  name="customExpiration"
                  value={customExpirationTime}
                  onFocus={() => { handleChangeExpirationType('custom') }}
                  onChange={e => handleChangeCustomExpirationTime(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* DescriptionForm */}
        <div className="form-group row">
          <label htmlFor="inputDesc" className="col-md-5 col-form-label">{t('share_links.description')}</label>
          <div className="col-md-4">
            <input
              type="text"
              className="form-control"
              id="inputDesc"
              placeholder={t('share_links.enter_desc')}
              value={description}
              onChange={e => handleChangeDescription(e.target.value)}
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
