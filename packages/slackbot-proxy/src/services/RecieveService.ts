import { Service } from '@tsed/di';

@Service()
export class ReceiveService {

  receiveContentsFromSlack(body:{[key:string]:string}) : string {
    if (body.text === 'register') {
      console.log('register action occured');
      return 'register action occurd';
    }
    return 'return receiveContentsFromSlack';
  }

}
