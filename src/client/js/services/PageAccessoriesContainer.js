import { Container } from 'unstated';

/**
 * Service container related to options for Application
 * @extends {Container} unstated Container
 */

export default class PageAccessoriesContainer extends Container {

  constructor(appContainer) {
    super();

    this.appContainer = appContainer;

    this.state = {
      isPageAccessoriesModalShown: false,
      activeTab: '',
      // Prevent unnecessary rendering
      activeComponents: new Set(['']),
    };
    this.openPageAccessoriesModal = this.openPageAccessoriesModal.bind(this);
    this.closePageAccessoriesModal = this.closePageAccessoriesModal.bind(this);
    this.switchActiveTab = this.switchActiveTab.bind(this);
  }

  /**
   * Workaround for the mangling in production build to break constructor.name
   */
  static getClassName() {
    return 'PageAccessoriesContainer';
  }


  openPageAccessoriesModal(activeTab) {
    this.setState({
      isPageAccessoriesModalShown: true,
    });
    this.switchActiveTab(activeTab);
  }

  closePageAccessoriesModal() {
    this.setState({
      isPageAccessoriesModalShown: false,
    });
  }

  switchActiveTab(activeTab) {
    this.setState({
      activeTab, activeComponents: this.state.activeComponents.add(activeTab),
    });
    this.navSlider();
  }

  // This is setup with bootstrap 3

  /**
  * If you have LESS than one navbar, then just do
  * let menu = document.getElementsByClassName( 'nav' )[0];
  */

 menu = document.getElementsByClassName('nav');

 // Might make this dynamic for px, %, pt, em
 getPercentage(min, max) {
   return min / max * 100;
 }

 // Not using reduce, because IE8 doesn't supprt it
 getArraySum(arr) {
   let sum = 0;
   [].forEach.call(arr, (el, index) => {
     sum += el;
   });
   return sum;
 }


 navSlider(menu, callback) {
   const menuWidth = menu.offsetWidth;
   // We only want the <li> </li> tags
   const navTabs = menu.getElementsByTagName('li.nav-link');
   if (menu.length > 0) {
     const marginLeft = [];
     // Loop through nav children i.e li
     [].forEach.call(navTabs, (el, index) => {
       // Dynamic width/margin calculation for hr
       const width = this.getPercentage(el.offsetWidth, menuWidth);
       let tempMarginLeft = 0;
       // We don't want to modify first elements positioning
       if (index !== 0) {
         tempMarginLeft = this.getArraySum(marginLeft);
       }
       // Set mouse event  hover/click
       callback(el, width, tempMarginLeft);
       /* We store it in array because the later accumulated value is used for positioning */
       marginLeft.push(width);
     });
   }
 }

 //  menu = document.getElementsByClassName('nav');

 // Values are set.
 if(menu) {
   // CLICK
   const menuSliderClick = document.getElementById('nav_slide_click');
   if (menuSliderClick) {
     this.navSlider(menu[1], (el, width, tempMarginLeft) => {
       console.log(width);
       console.log(tempMarginLeft);

       el.onclick = () => {
         menuSliderClick.style.width = `${width}%`;
         menuSliderClick.style.marginLeft = `${tempMarginLeft}%`;
       };
     });
   }
 } // endif


}
