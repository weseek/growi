import { Container } from 'unstated';

import loggerFactory from '@alias/logger';

import { toastError } from '../util/apiNotification';

// eslint-disable-next-line no-unused-vars
const logger = loggerFactory('growi:services:AdminCustomizeContainer');

/**
 * Service container for admin customize setting page (Customize.jsx)
 * @extends {Container} unstated Container
 */
export default class AdminCustomizeContainer extends Container {

  constructor(appContainer) {
    super();

    this.appContainer = appContainer;

    this.state = {
      // TODO GW-575 set data from apiV3
      currentTheme: appContainer.config.themeType,
      currentLayout: appContainer.config.layoutType,
      currentBehavior: appContainer.config.behaviorType,
      isEnabledTimeline: appContainer.config.isEnabledTimeline,
      isSavedStatesOfTabChanges: appContainer.config.isSavedStatesOfTabChanges,
      isEnabledAttachTitleHeader: appContainer.config.isEnabledAttachTitleHeader,
      currentRecentCreatedLimit: appContainer.config.recentCreatedLimit,
      currentHighlightJsStyleId: appContainer.config.highlightJsStyle,
      isHighlightJsStyleBorderEnabled: appContainer.config.highlightJsStyleBorder,
      currentCustomizeHeader: appContainer.config.customizeHeader,
      currentCustomizeCss: appContainer.config.customizeCss,
      currentCustomizeScript: appContainer.config.customizeScript,
      /* eslint-disable quote-props, no-multi-spaces */
      highlightJsCssSelectorOptions: {
        'github':           { name: '[Light] GitHub',         border: false },
        'github-gist':      { name: '[Light] GitHub Gist',    border: true },
        'atom-one-light':   { name: '[Light] Atom One Light', border: true },
        'xcode':            { name: '[Light] Xcode',          border: true },
        'vs':               { name: '[Light] Vs',             border: true },
        'atom-one-dark':    { name: '[Dark] Atom One Dark',   border: false },
        'hybrid':           { name: '[Dark] Hybrid',          border: false },
        'monokai':          { name: '[Dark] Monokai',         border: false },
        'tomorrow-night':   { name: '[Dark] Tomorrow Night',  border: false },
        'vs2015':           { name: '[Dark] Vs 2015',         border: false },
      },
      /* eslint-enable quote-props, no-multi-spaces */
    };

    this.init();

  }

  /**
   * Workaround for the mangling in production build to break constructor.name
   */
  static getClassName() {
    return 'AdminCustomizeContainer';
  }

  /**
   * retrieve customize data
   */
  async init() {
    // TODO GW-575 fetch data with apiV3
    try {
      // search style name from object for display
      this.setState({ currentHighlightJsStyleName: this.state.highlightJsCssSelectorOptions[this.state.currentHighlightJsStyleId].name });
    }
    catch (err) {
      logger.error(err);
      toastError(new Error('Failed to fetch data'));
    }
  }

  /**
   * Fetch highLight theme
   */
  async fetchHighLightTheme() {
    const response = await this.appContainer.apiv3.get('/customize-setting/');
    this.setState({
      highlightJsCssSelectorOptions: response.data.highlightJsCssSelectorOptions,
    });
  }

  /**
   * Switch layoutType
   */
  switchLayoutType(lauoutName) {
    this.setState({ currentLayout: lauoutName });
  }

  /**
   * Switch themeType
   */
  switchThemeType(themeName) {
    // can't choose theme when kibela
    if (this.state.currentLayout === 'kibela') {
      return;
    }
    this.setState({ currentTheme: themeName });
  }

  /**
   * Switch behaviorType
   */
  switchBehaviorType(behaviorName) {
    this.setState({ currentBehavior: behaviorName });
  }

  /**
   * Switch enabledTimeLine
   */
  switchEnableTimeline() {
    this.setState({ isEnabledTimeline:  !this.state.isEnabledTimeline });
  }

  /**
   * Switch savedStatesOfTabChanges
   */
  switchSavedStatesOfTabChanges() {
    this.setState({ isSavedStatesOfTabChanges:  !this.state.isSavedStatesOfTabChanges });
  }

  /**
   * Switch enabledAttachTitleHeader
   */
  switchEnabledAttachTitleHeader() {
    this.setState({ isEnabledAttachTitleHeader:  !this.state.isEnabledAttachTitleHeader });
  }

  /**
   * Switch recentCreatedLimit
   */
  switchRecentCreatedLimit(value) {
    this.setState({ currentRecentCreatedLimit: value });
  }

  /**
   * Switch highlightJsStyle
   */
  switchHighlightJsStyle(styleId, styleName, isBorderEnable) {
    this.setState({ currentHighlightJsStyleId: styleId });
    this.setState({ currentHighlightJsStyleName: styleName });
    // recommended settings are applied
    this.setState({ isHighlightJsStyleBorderEnabled: isBorderEnable });
  }

  /**
   * Switch highlightJsStyleBorder
   */
  switchHighlightJsStyleBorder() {
    this.setState({ isHighlightJsStyleBorderEnabled: !this.state.isHighlightJsStyleBorderEnabled });
  }

  /**
   * Change customize Html header
   */
  changeCustomizeHeader(inputValue) {
    this.setState({ currentCustomizeHeader: inputValue });
  }

  /**
   * Change customize css
   */
  changeCustomizeCss(inputValue) {
    this.setState({ currentCustomizeCss: inputValue });
  }

  /**
   * Change customize script
   */
  changeCustomizeScript(inpuValue) {
    this.setState({ currentCustomizeScript: inpuValue });
  }


  /**
   * Update layout
   * @memberOf AdminCustomizeContainer
   * @return {Array} Appearance
   */
  async updateCustomizeLayoutAndTheme() {
    const response = await this.appContainer.apiv3.put('/customize-setting/layoutTheme', {
      layoutType: this.state.currentLayout,
      themeType: this.state.currentTheme,
    });
    const { customizedParams } = response.data;
    return customizedParams;
  }

  /**
   * Update behavior
   * @memberOf AdminCustomizeContainer
   * @return {string} Behavior
   */
  async updateCustomizeBehavior() {
    const response = await this.appContainer.apiv3.put('/customize-setting/behavior', {
      behaviorType: this.state.currentBehavior,
    });
    const { customizedParams } = response.data;
    return customizedParams;
  }

  /**
   * Update function
   * @memberOf AdminCustomizeContainer
   * @return {string} Functions
   */
  async updateCustomizeFunction() {
    const response = await this.appContainer.apiv3.put('/customize-setting/function', {
      isEnabledTimeline: this.state.isEnabledTimeline,
      isSavedStatesOfTabChanges: this.state.isSavedStatesOfTabChanges,
      isEnabledAttachTitleHeader: this.state.isEnabledAttachTitleHeader,
      recentCreatedLimit: this.state.currentRecentCreatedLimit,
    });
    const { customizedParams } = response.data;
    return customizedParams;
  }

  /**
   * Update code highlight
   * @memberOf AdminCustomizeContainer
   * @return {Array} Code highlight
   */
  async updateHighlightJsStyle() {
    const response = await this.appContainer.apiv3.put('/customize-setting/highlight', {
      highlightJsStyle: this.state.currentHighlightJsStyleId,
      highlightJsStyleBorder: this.state.isHighlightJsStyleBorderEnabled,
    });
    const { customizedParams } = response.data;
    return customizedParams;
  }

  /**
   * Update customHeader
   * @memberOf AdminCustomizeContainer
   * @return {string} Customize html header
   */
  async updateCustomizeHeader() {
    const response = await this.appContainer.apiv3.put('/customize-setting/customize-header', {
      customizeHeader: this.state.currentCustomizeHeader,
    });
    const { customizedParams } = response.data;
    return customizedParams;
  }

  /**
   * Update customCss
   * @memberOf AdminCustomizeContainer
   * @return {string} Customize css
   */
  async updateCustomizeCss() {
    const response = await this.appContainer.apiv3.put('/customize-setting/customize-css', {
      customizeCss: this.state.currentCustomizeCss,
    });
    const { customizedParams } = response.data;
    return customizedParams;
  }

  /**
   * Update customize script
   * @memberOf AdminCustomizeContainer
   * @return {string} Customize scripts
   */
  async updateCustomizeScript() {
    const response = await this.appContainer.apiv3.put('/customize-setting/customize-script', {
      customizeScript: this.state.currentCustomizeScript,
    });
    const { customizedParams } = response.data;
    return customizedParams;
  }

}
