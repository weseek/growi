const generateEnvVarDicForApiRateLimiter = (): {[key: string]: string} => {
  const envVarDic = process.env;

  // pick up API_RATE_LIMIT_* from ENV
  const apiRateEndpointKeys = Object.keys(envVarDic).filter((key) => {
    const endpointRegExp = /^API_RATE_LIMIT_.*/;
    return endpointRegExp.test(key);
  });

  let apiRateEndpointDic;
  apiRateEndpointKeys.forEach((key) => {
    apiRateEndpointDic[key] = envVarDic[key];
  });

  // default setting e.g. healthchack

  return apiRateEndpointDic;
};

export default generateEnvVarDicForApiRateLimiter;
