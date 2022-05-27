const generateEnvVarDicForApiRateLimiter = (): {[key: string]: string} => {
  const envVarDic = process.env;

  // pick up API_RATE_LIMIT_* from ENV
  const apiRateEndpointKeys = Object.keys(envVarDic).filter((key) => {
    const endpointRegExp = /^API_RATE_LIMIT_.*/;
    return endpointRegExp.test(key);
  });

  const apiRateEndpointDic: {[key: string]: string} = {};
  apiRateEndpointKeys.forEach((key) => {
    const value = envVarDic[key];
    if (value != null) {
      apiRateEndpointDic[key] = value;
    }
  });

  // default setting e.g. healthchack

  return apiRateEndpointDic;
};

export default generateEnvVarDicForApiRateLimiter;
