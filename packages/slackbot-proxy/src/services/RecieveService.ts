import { Service } from '@tsed/di';
import { openModal } from '../../../slack/src/services/register';

@Service()
export class ReceiveService {

  receive(body) {
    if (body.text === 'register') {
      console.log(body);
      return this.register(body);
    }
    return;
  }

  register(body) {
    openModal(body);
  }

}
