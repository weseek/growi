export type DrawioConfig = {
  css: string,
  customFonts: string[],
}

export class DrawioCommunicationHelper {

  drawioUri: string;

  drawioConfig: DrawioConfig;

  constructor(drawioUri: string, drawioConfig: DrawioConfig) {
    this.drawioUri = drawioUri;
    this.drawioConfig = drawioConfig;
  }

  onReceiveMessage(event: MessageEvent, drawioMxFile: string, onClose: () => void): void {

    // check origin

    if (event.data === 'ready') {
      event.source?.postMessage(drawioMxFile, { targetOrigin: '*' });
      return;
    }

    if (event.data === '{"event":"configure"}') {
      if (event.source == null) {
        return;
      }

      // refs:
      //  * https://desk.draw.io/support/solutions/articles/16000103852-how-to-customise-the-draw-io-interface
      //  * https://desk.draw.io/support/solutions/articles/16000042544-how-does-embed-mode-work-
      //  * https://desk.draw.io/support/solutions/articles/16000058316-how-to-configure-draw-io-
      event.source.postMessage(JSON.stringify({
        action: 'configure',
        config: this.drawioConfig,
      }), { targetOrigin: '*' });

      return;
    }

    if (typeof event.data === 'string' && event.data.match(/mxfile/)) {
      if (event.data.length > 0) {
        const parser = new DOMParser();
        const dom = parser.parseFromString(event.data, 'text/xml');
        const drawioData = dom.getElementsByTagName('diagram')[0].innerHTML;

        /*
        * Saving Drawio will be implemented by the following tasks
        * https://redmine.weseek.co.jp/issues/100845
        * https://redmine.weseek.co.jp/issues/104507
        */

        // if (props.onSave != null) {
        //   props.onSave(drawioData);
        // }
      }

      onClose();

      return;
    }

    if (typeof event.data === 'string' && event.data.length === 0) {
      onClose();
      return;
    }

    // NOTHING DONE. (Receive unknown iframe message.)
  }

}
