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

    this.onChangeEnableXss = this.onChangeEnableXss.bind(this);
    this.onChangeXssOption = this.onChangeXssOption.bind(this);
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
  onChangeEnableXss() {
    this.setState({ isEnabledXss: !this.state.isEnabledXss });
  }

  /**
   * Switch xssOption
   * @param {value} int
   */
  onChangeXssOption(value) {
    this.setState({ XssOption: value });
  }

  /**
   * Change whiteListValue
   * @param {value} string
   */
  onChangeTagWhiteList(value) {
    this.setState({ tagWhiteList: value });
  }

  /**
   * Change whiteListValue
   * @param {value} string
   */
  onChangeAttrWhiteList(value) {
    this.setState({ attrWhiteList: value });
  }


}
