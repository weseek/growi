import { isServer } from '@growi/core/dist/utils';
import { Container } from 'unstated';

import { apiv3Get, apiv3Put } from '../util/apiv3-client';

interface AdminContentDispositionState {

}


export default class AdminContentDispositionContainer extends Container<AdminContentDispositionContainer> {

  constructor(appContainer) {
    super();

    if (isServer()) {
      return;
    }

    // this.appContainer = appContainer;

    // this.state = {

    // };


  }

  /**
   * Workaround for the mangling in production build to break constructor.name
   */
  static getClassName() {
    return 'AdminContentDispositionContainer';
  }

  /**
   * retrieve markdown data
   */
  async retrieveContentDispositionSettings() {
    const response = await apiv3Get('/content-disposition-settings/');
    const { contentDispositionSettings } = response.data;

    this.setState({

    });
  }




}
