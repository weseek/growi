import { Container } from 'unstated';

import loggerFactory from '@alias/logger';

// eslint-disable-next-line no-unused-vars
const logger = loggerFactory('growi:services:AdminSecurityContainer');

/**
 * Service container for admin security page (SecurityManagement.jsx)
 * @extends {Container} unstated Container
 */
export default class AdminSecurityContainer extends Container {

  constructor(appContainer) {
    super();

    this.appContainer = appContainer;

    this.state = {
      // TODO GW-583 set value
      useOnlyEnvVarsForSomeOptions: true,
      isLocalEnabled: true,
      registrationMode: 'open',
      registrationWhiteList: '',
      ldapConfig: {
        isEnabled: true,
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
      },
    };

    this.init();

    this.switchIsLocalEnabled = this.switchIsLocalEnabled.bind(this);
    this.changeRegistrationMode = this.changeRegistrationMode.bind(this);
  }

  init() {
    // TODO GW-583 fetch config value with api
  }


  /**
   * Workaround for the mangling in production build to break constructor.name
   */
  static getClassName() {
    return 'AdminSecurityContainer';
  }

  /**
   * Switch local enabled
   */
  switchIsLocalEnabled() {
    this.setState({ isLocalEnabled: !this.state.isLocalEnabled });
  }

  /**
   * Change registration mode
   */
  changeRegistrationMode(value) {
    this.setState({ registrationMode: value });
  }

  // LDAP function

  /**
   * Switch local enabled
   */
  switchIsLdapEnabled() {
    const newLdapConfig = this.state.ldapConfig;
    newLdapConfig.isEnabled = !this.state.ldapConfig.isEnabled;
    this.setState({ newLdapConfig });
  }

  /**
   * Change server url
   */
  changeServerUrl(inputValue) {
    const newLdapConfig = this.state.ldapConfig;
    newLdapConfig.serverUrl = inputValue;
    this.setState({ newLdapConfig });
  }

  /**
   * Change ldap bind mode
   */
  changeLdapBindMode(mode) {
    const newLdapConfig = this.state.ldapConfig;
    newLdapConfig.bindMode = mode;
    this.setState({ newLdapConfig });
  }

  /**
   * Change bind DN
   */
  changeBindDN(inputValue) {
    const newLdapConfig = this.state.ldapConfig;
    newLdapConfig.bindDN = inputValue;
    this.setState({ newLdapConfig });
  }

  /**
   * Change bind DN password
   */
  changeBindDNPassword(inputValue) {
    const newLdapConfig = this.state.ldapConfig;
    newLdapConfig.bindDNPassword = inputValue;
    this.setState({ newLdapConfig });
  }

  /**
   * Change search filter
   */
  changeSearchFilter(inputValue) {
    const newLdapConfig = this.state.ldapConfig;
    newLdapConfig.searchFilter = inputValue;
    this.setState({ newLdapConfig });
  }

  /**
   * Change attr map username
   */
  changeAttrMapUsername(inputValue) {
    const newLdapConfig = this.state.ldapConfig;
    newLdapConfig.attrMapUsername = inputValue;
    this.setState({ newLdapConfig });
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
    const newLdapConfig = this.state.ldapConfig;
    newLdapConfig.attrMapMail = inputValue;
    this.setState({ newLdapConfig });
  }

  /**
   * Change attr map name
   */
  changeAttrMapName(inputValue) {
    const newLdapConfig = this.state.ldapConfig;
    newLdapConfig.attrMapName = inputValue;
    this.setState({ newLdapConfig });
  }

  /**
   * Change group search base
   */
  changeGroupSearchBase(inputValue) {
    const newLdapConfig = this.state.ldapConfig;
    newLdapConfig.groupSearchBase = inputValue;
    this.setState({ newLdapConfig });
  }

  /**
   * Change group search filter
   */
  changeGroupSearchFilter(inputValue) {
    const newLdapConfig = this.state.ldapConfig;
    newLdapConfig.groupSearchFilter = inputValue;
    this.setState({ newLdapConfig });
  }

}
