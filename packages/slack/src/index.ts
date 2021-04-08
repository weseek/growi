import { openRegisterModal } from '../../slackbot-proxy/src/services/RegisterService';


export const supportedSlackCommands: string[] = [
  '/growi',
];

export const supportedGrowiCommandsMappings = {
  search: 'search',
  create: 'create',
  register: 'register',
};


export const supportedGrowiCommandsAction = {
  register: (body:{[key:string]:string}) => openRegisterModal(body),
};
