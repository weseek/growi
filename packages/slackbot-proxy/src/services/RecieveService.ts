import { Service } from '@tsed/di';
import { JsonRequestBody } from '@tsed/schema';
// import { parse } from '../../../slack/src/utils/slash-command-parser';
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
