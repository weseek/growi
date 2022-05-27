// API_RATE_LIMIT_010_FOO_ENDPOINT=/_api/v3/foo
// API_RATE_LIMIT_010_FOO_METHODS=GET,POST
// API_RATE_LIMIT_010_FOO_CONSUME_POINTS=10

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
  apiRateEndpointDic.API_RATE_LIMIT_010_HEALTHCHECK_ENDPOINT = '/_api/v3/healthcheck';
  apiRateEndpointDic.API_RATE_LIMIT_010_HEALTHCHECK_METHODS = 'GET';
  apiRateEndpointDic.API_RATE_LIMIT_010_HEALTHCHECK_CONSUME_POINTS = '0';


  return apiRateEndpointDic;
};

export default generateEnvVarDicForApiRateLimiter;
