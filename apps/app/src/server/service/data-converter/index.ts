import { renameDuplicateRootPages } from './rename-duplicate-root-pages';


export const runDataConversion = async(): Promise<void> => {
  await renameDuplicateRootPages();

  return;
};
