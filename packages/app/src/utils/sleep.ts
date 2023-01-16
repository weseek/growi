export const sleep = (msec: number): Promise<void> => new Promise(resolve => setTimeout(resolve, msec));
