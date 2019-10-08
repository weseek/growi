import { Container } from 'unstated';

/**
 * Service container for admin markdown setting page (MarkDownSetting.jsx)
 * @extends {Container} unstated Container
 */
export default class MarkDownSettingContainer extends Container {

  constructor(appContainer) {
    super();

    this.appContainer = appContainer;

    this.state = {
      isEnabledXss: (appContainer.config.xssOption != null),
      xssOption: appContainer.config.xssOption,
      tagWhiteList: appContainer.config.tagWhiteList || '',
      attrWhiteList: appContainer.config.attrWhiteList || '',
    };

    this.switchEnableXss = this.switchEnableXss.bind(this);
  }

  /**
   * Workaround for the mangling in production build to break constructor.name
   */
  static getClassName() {
    return 'MarkDownSettingContainer';
  }

  /**
   * Switch enableXss
   */
  switchEnableXss() {
    if (this.state.isEnabledXss) {
      this.setState({ xssOption: null });
    }
    this.setState({ isEnabledXss: !this.state.isEnabledXss });
  }

  /**
   * Update Xss Setting
   */
  async updateXssSetting() {

    const response = await this.appContainer.apiv3.put('/markdown-setting/xss', {
      'markdown:xss:isEnabledPrevention': this.state.isEnabledXss,
      'markdown:xss:option': this.state.xssOption,
      'markdown:xss:tagWhiteList': this.state.tagWhiteList,
      'markdown:xss:attrWhiteList': this.state.attrWhiteList,
    });

    return response;
  }

}
