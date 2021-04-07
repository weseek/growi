import { Service } from '@tsed/di';
import { parse } from '@growi/slack/src/utils/slash-command-parser';
import { openRegisterModal } from './RegisterService';

@Service()
export class ReceiveService {

  async receiveContentsFromSlack(body:{[key:string]:string}) : string {
    const parseBody = parse(body);

    if (parseBody.growiCommandType === 'register') {
      await openRegisterModal(body);
      return 'register action occurd';
    }

    return 'return receiveContentsFromSlack';
  }

}
