// 'true' => true
// otherwise => false
export const stringToBoolean = (text: string): boolean => {
  if (text == null) {
    return false;
  }

  if (text === 'true') {
    return true;
  }

  return false;
};
