import React from 'react';
import PropTypes from 'prop-types';

const ProxyUrlFrom = (props) => {
  return (
    <span>ProxyUrlForm</span>
  );
};


ProxyUrlFrom.propTypes = {
  proxyUri: PropTypes.string.isRequired,
  setProxyUrl: PropTypes.func.isRequired,
  updateProxyUri: PropTypes.func.isRequired,
};

export default ProxyUrlFrom;
