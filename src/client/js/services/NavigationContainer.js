import { Container } from 'unstated';

/**
 * Service container related to options for Application
 * @extends {Container} unstated Container
 */

const SCROLL_THRES_SKIP = 200;
const WIKI_HEADER_LINK = 120;

export default class NavigationContainer extends Container {

  constructor(appContainer) {
    super();

    this.appContainer = appContainer;
    this.appContainer.registerContainer(this);

    const { localStorage } = window;

    this.state = {
      editorMode: 'view',

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
    this.setEditorMode = this.setEditorMode.bind(this);
    this.initDeviceSize();
    this.initScrollEvent();
  }

  /**
   * Workaround for the mangling in production build to break constructor.name
   */
  static getClassName() {
    return 'NavigationContainer';
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
      if (SCROLL_THRES_SKIP < currentYOffset) {
        return;
      }

      this.setState({
        isScrollTop: currentYOffset === 0,
      });
    });
  }

  setEditorMode(editorMode) {
    this.setState({ editorMode });
    if (editorMode === 'view') {
      $('body').removeClass('on-edit');
      $('body').removeClass('builtin-editor');
      $('body').removeClass('hackmd');
      window.history.replaceState(null, '', window.location.pathname);
    }

    if (editorMode === 'edit') {
      $('body').addClass('on-edit');
      $('body').addClass('builtin-editor');
      window.location.hash = '#edit';
    }

    if (editorMode === 'hackmd') {
      $('body').addClass('on-edit');
      $('body').addClass('hackmd');
      $('body').removeClass('builtin-editor');
      window.location.hash = '#hackmd';

    }

    this.updateDrawerMode({ ...this.state, editorMode }); // generate newest state object
  }

  toggleDrawer() {
    const { isDrawerOpened } = this.state;
    this.setState({ isDrawerOpened: !isDrawerOpened });
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
    const preferDrawerMode = editorMode !== 'view' ? preferDrawerModeOnEditByUser : preferDrawerModeByUser;

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

  /**
   * Function that implements the click event for realizing smooth scroll
   * @param {array} elements
   */
  addSmoothScrollEvent(elements = {}) {
    elements.forEach(link => link.addEventListener('click', (e) => {
      e.preventDefault();

      const href = link.getAttribute('href').replace('#', '');
      window.location.hash = href;
      const targetDom = document.getElementById(href);
      this.smoothScrollIntoView(targetDom, WIKI_HEADER_LINK);
    }));
  }

  smoothScrollIntoView(element = null, offsetTop = 0) {
    const targetElement = element || window.document.body;

    // get the distance to the target element top
    const rectTop = targetElement.getBoundingClientRect().top;

    const top = window.pageYOffset + rectTop - offsetTop;

    window.scrollTo({
      top,
      behavior: 'smooth',
    });
  }

}
