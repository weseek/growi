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
      retrieveError: null,
      currentTheme: '',
      currentLayout: '',
      currentBehavior: '',
      isEnabledTimeline: false,
      isSavedStatesOfTabChanges: false,
      isEnabledAttachTitleHeader: false,
      currentRecentCreatedLimit: 10,
      isEnabledStaleNotification: false,
      isAllReplyShown: false,
      currentHighlightJsStyleId: '',
      isHighlightJsStyleBorderEnabled: false,
      currentCustomizeTitle: '',
      currentCustomizeHeader: '',
      currentCustomizeCss: '',
      currentCustomizeScript: '',
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
  async retrieveCustomizeData() {
    try {
      const response = await this.appContainer.apiv3.get('/customize-setting/');
      const { customizeParams } = response.data;

      this.setState({
        currentTheme: customizeParams.themeType,
        currentLayout: customizeParams.layoutType,
        currentBehavior: customizeParams.behaviorType,
        isEnabledTimeline: customizeParams.isEnabledTimeline,
        isSavedStatesOfTabChanges: customizeParams.isSavedStatesOfTabChanges,
        isEnabledAttachTitleHeader: customizeParams.isEnabledAttachTitleHeader,
        currentRecentCreatedLimit: customizeParams.recentCreatedLimit,
        isEnabledStaleNotification: customizeParams.isEnabledStaleNotification,
        isAllReplyShown: customizeParams.isAllReplyShown,
        currentHighlightJsStyleId: customizeParams.styleName,
        isHighlightJsStyleBorderEnabled: customizeParams.styleBorder,
        currentCustomizeTitle: customizeParams.customizeTitle,
        currentCustomizeHeader: customizeParams.customizeHeader,
        currentCustomizeCss: customizeParams.customizeCss,
        currentCustomizeScript: customizeParams.customizeScript,
      });

      // search style name from object for display
      this.setState({ currentHighlightJsStyleName: this.state.highlightJsCssSelectorOptions[customizeParams.styleName].name });
    }
    catch (err) {
      this.setState({ retrieveError: err });
      logger.error(err);
      throw new Error('Failed to fetch data');
    }
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

    // preview if production
    if (process.env.NODE_ENV !== 'development') {
      this.previewTheme(themeName);
    }
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
   * Switch enabledStaleNotification
   */
  switchEnableStaleNotification() {
    this.setState({ isEnabledStaleNotification:  !this.state.isEnabledStaleNotification });
  }

  /**
   * Switch isAllReplyShown
   */
  switchIsAllReplyShown() {
    this.setState({ isAllReplyShown: !this.state.isAllReplyShown });
  }

  /**
   * Switch highlightJsStyle
   */
  switchHighlightJsStyle(styleId, styleName, isBorderEnable) {
    this.setState({ currentHighlightJsStyleId: styleId });
    this.setState({ currentHighlightJsStyleName: styleName });
    // recommended settings are applied
    this.setState({ isHighlightJsStyleBorderEnabled: isBorderEnable });

    this.previewHighlightJsStyle(styleId);
  }

  /**
   * Switch highlightJsStyleBorder
   */
  switchHighlightJsStyleBorder() {
    this.setState({ isHighlightJsStyleBorderEnabled: !this.state.isHighlightJsStyleBorderEnabled });
  }

  /**
   * Change customize Title
   */
  changeCustomizeTitle(inputValue) {
    this.setState({ currentCustomizeTitle: inputValue });
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
   * Preview theme
   * @param {string} themeName
   */
  async previewTheme(themeName) {
    try {
      // get theme asset path
      const response = await this.appContainer.apiv3.get('/customize-setting/layout-theme/asset-path', { themeName });
      const { assetPath } = response.data;

      const themeLink = document.getElementById('grw-theme-link');
      themeLink.setAttribute('href', assetPath);
    }
    catch (err) {
      toastError(err);
    }
  }

  /**
   * Preview hljs style
   * @param {string} styleId
   */
  previewHighlightJsStyle(styleId) {
    const styleLInk = document.querySelectorAll('#grw-hljs-container-for-demo link')[0];
    // replace css url
    // see https://regex101.com/r/gBNZYu/4
    styleLInk.href = styleLInk.href.replace(/[^/]+\.css$/, `${styleId}.css`);
  }

  /**
   * Update layout
   * @memberOf AdminCustomizeContainer
   */
  async updateCustomizeLayoutAndTheme() {
    try {
      const response = await this.appContainer.apiv3.put('/customize-setting/layout-theme', {
        layoutType: this.state.currentLayout,
        themeType: this.state.currentTheme,
      });
      const { customizedParams } = response.data;
      this.setState({
        layoutType: customizedParams.layoutType,
        themeType: customizedParams.themeType,
      });
    }
    catch (err) {
      logger.error(err);
      throw new Error('Failed to update data');
    }
  }

  /**
   * Update behavior
   * @memberOf AdminCustomizeContainer
   */
  async updateCustomizeBehavior() {
    try {
      const response = await this.appContainer.apiv3.put('/customize-setting/behavior', {
        behaviorType: this.state.currentBehavior,
      });
      const { customizedParams } = response.data;
      this.setState({
        behaviorType: customizedParams.behaviorType,
      });
    }
    catch (err) {
      logger.error(err);
      throw new Error('Failed to update data');
    }
  }

  /**
   * Update function
   * @memberOf AdminCustomizeContainer
   */
  async updateCustomizeFunction() {
    try {
      const response = await this.appContainer.apiv3.put('/customize-setting/function', {
        isEnabledTimeline: this.state.isEnabledTimeline,
        isSavedStatesOfTabChanges: this.state.isSavedStatesOfTabChanges,
        isEnabledAttachTitleHeader: this.state.isEnabledAttachTitleHeader,
        recentCreatedLimit: this.state.currentRecentCreatedLimit,
        isEnabledStaleNotification: this.state.isEnabledStaleNotification,
        isAllReplyShown: this.state.isAllReplyShown,
      });
      const { customizedParams } = response.data;
      this.setState({
        isEnabledTimeline: customizedParams.isEnabledTimeline,
        isSavedStatesOfTabChanges: customizedParams.isSavedStatesOfTabChanges,
        isEnabledAttachTitleHeader: customizedParams.isEnabledAttachTitleHeader,
        recentCreatedLimit: customizedParams.currentRecentCreatedLimit,
        isEnabledStaleNotification: customizedParams.isEnabledStaleNotification,
        isAllReplyShown: customizedParams.isAllReplyShown,
      });
    }
    catch (err) {
      logger.error(err);
      throw new Error('Failed to update data');
    }
  }

  /**
   * Update code highlight
   * @memberOf AdminCustomizeContainer
   */
  async updateHighlightJsStyle() {
    try {
      const response = await this.appContainer.apiv3.put('/customize-setting/highlight', {
        highlightJsStyle: this.state.currentHighlightJsStyleId,
        highlightJsStyleBorder: this.state.isHighlightJsStyleBorderEnabled,
      });
      const { customizedParams } = response.data;
      this.setState({
        highlightJsStyle: customizedParams.highlightJsStyle,
        highlightJsStyleBorder: customizedParams.highlightJsStyleBorder,
      });
    }
    catch (err) {
      logger.error(err);
      throw new Error('Failed to update data');
    }
  }

  /**
   * Update customTitle
   * @memberOf AdminCustomizeContainer
   */
  async updateCustomizeTitle() {
    try {
      const response = await this.appContainer.apiv3.put('/customize-setting/customize-title', {
        customizeTitle: this.state.currentCustomizeTitle,
      });
      const { customizedParams } = response.data;
      this.setState({
        customizeTitle: customizedParams.customizeTitle,
      });
    }
    catch (err) {
      logger.error(err);
      throw new Error('Failed to update data');
    }
  }

  /**
   * Update customHeader
   * @memberOf AdminCustomizeContainer
   */
  async updateCustomizeHeader() {
    try {
      const response = await this.appContainer.apiv3.put('/customize-setting/customize-header', {
        customizeHeader: this.state.currentCustomizeHeader,
      });
      const { customizedParams } = response.data;
      this.setState({
        currentCustomizeHeader: customizedParams.customizeHeader,
      });
    }
    catch (err) {
      logger.error(err);
      throw new Error('Failed to update data');
    }
  }

  /**
   * Update customCss
   * @memberOf AdminCustomizeContainer
   */
  async updateCustomizeCss() {
    try {
      const response = await this.appContainer.apiv3.put('/customize-setting/customize-css', {
        customizeCss: this.state.currentCustomizeCss,
      });
      const { customizedParams } = response.data;
      this.setState({
        currentCustomizeCss: customizedParams.customizeCss,
      });
    }
    catch (err) {
      logger.error(err);
      throw new Error('Failed to update data');
    }
  }

  /**
   * Update customize script
   * @memberOf AdminCustomizeContainer
   * @return {string} Customize scripts
   */
  async updateCustomizeScript() {
    try {
      const response = await this.appContainer.apiv3.put('/customize-setting/customize-script', {
        customizeScript: this.state.currentCustomizeScript,
      });
      const { customizedParams } = response.data;
      this.setState({
        currentCustomizeScript: customizedParams.customizeScript,
      });
    }
    catch (err) {
      logger.error(err);
      throw new Error('Failed to update data');
    }
  }

}
