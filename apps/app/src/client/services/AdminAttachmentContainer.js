import { isServer } from '@growi/core/dist/utils';
import { Container } from 'unstated';

import { apiv3Get, apiv3Put } from '../util/apiv3-client';

export default class AdminAttachmentContainer extends Container {

  constructor(appContainer) {
    super();

    if (isServer()) {
      return;
    }

    this.appContainer = appContainer;


    this.state = {
      imagepng: true,
      imagejpeg: true,
      imagegif: true,
      imagewebp: true,
      imagebmp: true,
      imagexicon: true,
      applicationpdf: true,
      videomp4: true,
      audiompeg: true,
      textplain: true,
    };
  }

  async retrieveContentTypeSettings() {
    const response = await apiv3Get('/content-type-settings/');
    const { contentTypes } = response.data.contentTypes;

    this.setState({
      imagepng: contentTypes.imagepng,
      imagejpeg: contentTypes.imagejpeg,
      imagegif: contentTypes.imagegif,
      imagewebp: contentTypes.imagewebp,
      imagebmp: contentTypes.imagebmp,
      imagexicon: contentTypes.imagexicon,
      applicationpdf: contentTypes.applicationpdf,
      videomp4: contentTypes.videomp4,
      audiompeg: contentTypes.audiompeg,
      textplain: contentTypes.textplain,
    });
  }

  async setStrictContentDispositionSettings() {

    await apiv3Put('/content-disposition-settings', {
    });
  }


  async setModerateContentDispositionSettings() {

    await apiv3Put('/content-disposition-settings', {
    });
  }


  async setLaxContentDispositionSettings() {

    await apiv3Put('/content-disposition-settings', {
    });
  }

}
