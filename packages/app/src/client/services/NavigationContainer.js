import { Container } from 'unstated';
import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:services:NavigationContainer');

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

      isScrollTop: true,
    };

    this.setEditorMode = this.setEditorMode.bind(this);
    this.initScrollEvent();
  }

  /**
   * Workaround for the mangling in production build to break constructor.name
   */
  static getClassName() {
    return 'NavigationContainer';
  }

  getPageContainer() {
    return this.appContainer.getContainer('PageContainer');
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
    const { isNotCreatable } = this.getPageContainer().state;

    if (this.appContainer.currentUser == null) {
      logger.warn('Please login or signup to edit the page or use hackmd.');
      return;
    }

    if (isNotCreatable) {
      logger.warn('This page could not edit.');
      return;
    }

    this.setState({ editorMode });
    if (editorMode === 'view') {
      $('body').removeClass('on-edit');
      $('body').removeClass('builtin-editor');
      $('body').removeClass('hackmd');
      $('body').removeClass('pathname-sidebar');
      window.history.replaceState(null, '', window.location.pathname);
    }

    if (editorMode === 'edit') {
      $('body').addClass('on-edit');
      $('body').addClass('builtin-editor');
      $('body').removeClass('hackmd');
      // editing /Sidebar
      if (window.location.pathname === '/Sidebar') {
        $('body').addClass('pathname-sidebar');
      }
      window.location.hash = '#edit';
    }

    if (editorMode === 'hackmd') {
      $('body').addClass('on-edit');
      $('body').addClass('hackmd');
      $('body').removeClass('builtin-editor');
      $('body').removeClass('pathname-sidebar');
      window.location.hash = '#hackmd';
    }

    this.updateDrawerMode({ ...this.state, editorMode }); // generate newest state object
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
  // updateDrawerMode(newState) {
  //   const {
  //     editorMode, isDeviceSmallerThanMd, preferDrawerModeByUser, preferDrawerModeOnEditByUser,
  //   } = newState;

  //   // get preference on view or edit
  //   const preferDrawerMode = editorMode !== 'view' ? preferDrawerModeOnEditByUser : preferDrawerModeByUser;

  //   const isDrawerMode = isDeviceSmallerThanMd || preferDrawerMode;
  //   const isDrawerOpened = false; // close Drawer anyway

  //   this.setState({ isDrawerMode, isDrawerOpened });
  // }

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
