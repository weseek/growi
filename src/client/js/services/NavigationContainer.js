import { Container } from 'unstated';

/**
 * Service container related to options for Application
 * @extends {Container} unstated Container
 */

const scrollThresForThrottling = 100;

export default class NavigationContainer extends Container {

  constructor(appContainer) {
    super();

    this.appContainer = appContainer;
    this.appContainer.registerContainer(this);

    const { localStorage } = window;

    this.state = {
      editorMode: null,

      isDeviceSmallerThanMd: null,
      preferDrawerModeByUser: localStorage.preferDrawerModeByUser === 'true',
      preferDrawerModeOnEditByUser: // default: true
        localStorage.preferDrawerModeOnEditByUser == null || localStorage.preferDrawerModeOnEditByUser === 'true',
      isDrawerMode: null,
      isDrawerOpened: false,

      sidebarContentsId: 'recent',

      isScrollTop: true,

      isPageCreateModalShown: false,
    };

    this.openPageCreateModal = this.openPageCreateModal.bind(this);
    this.closePageCreateModal = this.closePageCreateModal.bind(this);

    this.initHotkeys();
    this.initDeviceSize();
    this.initScrollEvent();
  }

  /**
   * Workaround for the mangling in production build to break constructor.name
   */
  static getClassName() {
    return 'NavigationContainer';
  }

  initHotkeys() {
    window.addEventListener('keydown', (event) => {
      const target = event.target;

      // ignore when target dom is input
      const inputPattern = /^input|textinput|textarea$/i;
      if (inputPattern.test(target.tagName) || target.isContentEditable) {
        return;
      }

      if (event.key === 'c') {
        // don't fire when not needed
        if (!event.ctrlKey && !event.metaKey && !event.altKey && !event.shiftKey) {
          this.setState({ isPageCreateModalShown: true });
        }
      }
    });
  }

  initDeviceSize() {
    const mdOrAvobeHandler = async(mql) => {
      let isDeviceSmallerThanMd;

      // sm -> md
      if (mql.matches) {
        isDeviceSmallerThanMd = false;
      }
      // md -> sm
      else {
        isDeviceSmallerThanMd = true;
      }

      this.setState({ isDeviceSmallerThanMd });
      this.updateDrawerMode({ ...this.state, isDeviceSmallerThanMd }); // generate newest state object
    };

    this.appContainer.addBreakpointListener('md', mdOrAvobeHandler, true);
  }

  initScrollEvent() {
    window.addEventListener('scroll', () => {
      const currentYOffset = window.pageYOffset;

      // original throttling
      if (scrollThresForThrottling < currentYOffset) {
        return;
      }

      this.setState({
        isScrollTop: currentYOffset === 0,
      });
    });
  }

  setEditorMode(editorMode) {
    this.setState({ editorMode });
    this.updateDrawerMode({ ...this.state, editorMode }); // generate newest state object
  }

  toggleDrawer() {
    const { isDrawerOpened } = this.state;
    this.setState({ isDrawerOpened: !isDrawerOpened });

    // TODO: remove adding/removing classes after Reactify
    const body = document.body;
    const isOpenedInNewState = !isDrawerOpened;
    if (isOpenedInNewState) {
      body.classList.add('grw-drawer-opened');
    }
    else {
      body.classList.remove('grw-drawer-opened');
    }
  }

  /**
   * Set Sidebar mode preference by user
   * @param {boolean} preferDockMode
   */
  async setDrawerModePreference(bool) {
    this.setState({ preferDrawerModeByUser: bool });
    this.updateDrawerMode({ ...this.state, preferDrawerModeByUser: bool }); // generate newest state object

    // store settings to localStorage
    const { localStorage } = window;
    localStorage.preferDrawerModeByUser = bool;
  }

  /**
   * Set Sidebar mode preference by user
   * @param {boolean} preferDockMode
   */
  async setDrawerModePreferenceOnEdit(bool) {
    this.setState({ preferDrawerModeOnEditByUser: bool });
    this.updateDrawerMode({ ...this.state, preferDrawerModeOnEditByUser: bool }); // generate newest state object

    // store settings to localStorage
    const { localStorage } = window;
    localStorage.preferDrawerModeOnEditByUser = bool;
  }

  /**
   * Update drawer related state by specified 'newState' object
   * @param {object} newState A newest state object
   *
   * Specify 'newState' like following code:
   *
   *   { ...this.state, overwriteParam: overwriteValue }
   *
   * because updating state of unstated container will be delayed unless you use await
   */
  updateDrawerMode(newState) {
    const {
      editorMode, isDeviceSmallerThanMd, preferDrawerModeByUser, preferDrawerModeOnEditByUser,
    } = newState;

    // get preference on view or edit
    const preferDrawerMode = editorMode != null ? preferDrawerModeOnEditByUser : preferDrawerModeByUser;

    const isDrawerMode = isDeviceSmallerThanMd || preferDrawerMode;
    const isDrawerOpened = false; // close Drawer anyway

    this.setState({ isDrawerMode, isDrawerOpened });
  }

  openPageCreateModal() {
    this.setState({ isPageCreateModalShown: true });
  }

  closePageCreateModal() {
    this.setState({ isPageCreateModalShown: false });
  }

}
