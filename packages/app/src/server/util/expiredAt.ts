// 10 minutes
export const expiredAt = (): Date => {
  return new Date(Date.now() + 600000);
};
