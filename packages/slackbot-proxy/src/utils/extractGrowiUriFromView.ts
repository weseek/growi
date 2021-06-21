export const extractGrowiUriFromView = (view:{'private_metadata': string}): {growiUri?:string, originalData:{[key:string]:any}} => {
  const parsedValues = JSON.parse(view.private_metadata);
  if (parsedValues.originalData != null) {
    parsedValues.originalData = JSON.parse(parsedValues.originalData);
  }
  return parsedValues;
};
