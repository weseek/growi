import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

const ProxyUrlFrom = (props) => {

  const { t } = useTranslation();

  return (
    <div className="form-group row my-4">
      <label className="text-left text-md-right col-md-3 col-form-label mt-3">Proxy URL</label>
      <div className="col-md-6 mt-3">
        <input
          className="form-control"
          type="text"
          name="settingForm[proxyUrl]"
          defaultValue={props.proxyUri}
          onChange={(e) => { props.setProxyUri(e.target.value) }}
        />
      </div>
      <div className="col-md-2 mt-3 text-center text-md-left">
        <button type="button" className="btn btn-primary" onClick={props.updateProxyUri} disabled={false}>{ t('Update') }</button>
      </div>
    </div>
  );
};

ProxyUrlFrom.propTypes = {
  proxyUri: PropTypes.string,
  setProxyUri: PropTypes.func.isRequired,
  updateProxyUri: PropTypes.func.isRequired,
};

export default ProxyUrlFrom;
