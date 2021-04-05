import { Service } from '@tsed/di';
import { openRegisterModal } from './RegisterService';


@Service()
export class ReceiveService {

  receiveContentsFromSlack(body:{[key:string]:string}) : string {
    if (body.text === 'register') {
      openRegisterModal(body);

      return 'register action occurd';
    }
    return 'return receiveContentsFromSlack';
  }

}
