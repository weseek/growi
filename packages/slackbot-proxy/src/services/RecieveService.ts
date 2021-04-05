import { Service } from '@tsed/di';

@Service()
export class ReceiveService {

  receiveContentsFromSlack(body) {
    if (body.text === 'register') {
      console.log(body);
    }
    return;
  }

}
