import { Container } from 'unstated';

import loggerFactory from '@alias/logger';

// eslint-disable-next-line no-unused-vars
const logger = loggerFactory('growi:security:AdminLdapSecurityContainer');

/**
 * Service container for admin security page (SecurityLdapSetting.jsx)
 * @extends {Container} unstated Container
 */
export default class AdminLdapSecurityContainer extends Container {

  constructor(appContainer) {
    super();

    this.appContainer = appContainer;

    this.state = {
      // TODO GW-583 set value
      serverUrl: '',
      bindMode: 'manager',
      bindDN: '',
      bindDNPassword: '',
      searchFilter: '',
      attrMapUsername: '',
      cbSameUsernameTreatedAsIdenticalUser: true,
      attrMapMail: '',
      attrMapName: '',
      groupSearchBase: '',
      groupSearchFilter: '',
      groupDnProperty: '',
    };

    this.init();

  }

  init() {
    // TODO GW-583 fetch config value with api
  }


  /**
   * Workaround for the mangling in production build to break constructor.name
   */
  static getClassName() {
    return 'AdminLdapSecurityContainer';
  }

  /**
   * Change server url
   */
  changeServerUrl(inputValue) {
    this.setState({ serverUrl: inputValue });
  }

  /**
   * Change ldap bind mode
   */
  changeLdapBindMode(mode) {
    this.setState({ bindMode: mode });
  }

  /**
   * Change bind DN
   */
  changeBindDN(inputValue) {
    this.setState({ bindDN: inputValue });
  }

  /**
   * Change bind DN password
   */
  changeBindDNPassword(inputValue) {
    this.setState({ bindDNPassword: inputValue });
  }

  /**
   * Change search filter
   */
  changeSearchFilter(inputValue) {
    this.setState({ searchFilter: inputValue });
  }

  /**
   * Change attr map username
   */
  changeAttrMapUsername(inputValue) {
    this.setState({ attrMapUsername: inputValue });
  }

  /**
   * Switch cb same username treated as identical user
   */
  switchCbSameUsernameTreatedAsIdenticalUser() {
    this.setState({ cbSameUsernameTreatedAsIdenticalUser: !this.state.cbSameUsernameTreatedAsIdenticalUser });
  }

  /**
   * Change attr map email
   */
  changeAttrMapMail(inputValue) {
    this.setState({ attrMapMail: inputValue });
  }

  /**
   * Change attr map name
   */
  changeAttrMapName(inputValue) {
    this.setState({ attrMapName: inputValue });
  }

  /**
   * Change group search base
   */
  changeGroupSearchBase(inputValue) {
    this.setState({ groupSearchBase: inputValue });
  }

  /**
   * Change group search filter
   */
  changeGroupSearchFilter(inputValue) {
    this.setState({ groupSearchFilter: inputValue });
  }

  /**
   * Change group dn property
   */
  changeGroupDnProperty(inputValue) {
    this.setState({ groupDnProperty: inputValue });
  }

}
