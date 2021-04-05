import { Service } from '@tsed/di';

@Service()
export class ReceiveService {

  receiveContentsFromSlack(body) {
    if (body.text === 'register') {
      return console.log('register action occured');
    }
    return;
  }

}
