import { Service } from '@tsed/di';

@Service()
export class ReceiveService {

  receive(body) {

    console.log('Receive Class', body);
    console.log('wai');
    return body;
  }

}
