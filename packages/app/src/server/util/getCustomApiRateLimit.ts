const getCustomApiRateLimit = (matchedEndpointKeys: string[], method: string): number | null => {

  let prioritizedTarget: [string, string] | null = null; // priprity and keyword
  matchedEndpointKeys.forEach((key) => {
    const target = key.replace('API_RATE_LIMIT_', '').replace('_ENDPOINT', '');
    const priority = target.split('_')[0];
    const keyword = target.split('_')[1];
    if (prioritizedTarget === null || Number(priority) > Number(prioritizedTarget[0])) {
      prioritizedTarget = [priority, keyword];
    }
  });

  if (prioritizedTarget === null) {
    return null;
  }

  const envVarDic = process.env;

  const targetMethodsKey = `API_RATE_LIMIT_${prioritizedTarget[0]}_${prioritizedTarget[1]}_METHODS`;
  const targetConsumePointsKey = `API_RATE_LIMIT_${prioritizedTarget[0]}_${prioritizedTarget[1]}_CONSUME_POINTS`;

  const targetMethods = envVarDic[targetMethodsKey];
  if (targetMethods === undefined || !targetMethods.includes(method)) {
    return null;
  }

  const customizedConsumePoints = envVarDic[targetConsumePointsKey];

  return Number(customizedConsumePoints);

};

export default getCustomApiRateLimit;
