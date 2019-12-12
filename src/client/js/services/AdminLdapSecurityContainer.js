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
      serverUrl: '',
      isUserBind: false,
      ldapBindDN: '',
      ldapBindDNPassword: '',
      ldapSearchFilter: '',
      ldapAttrMapUsername: '',
      isSameUsernameTreatedAsIdenticalUser: false,
      ldapAttrMapMail: '',
      ldapAttrMapName: '',
      ldapGroupSearchBase: '',
      ldapGroupSearchFilter: '',
      ldapGroupDnProperty: '',
    };

  }

  /**
   * retrieve security data
   */
  async retrieveSecurityData() {
    const response = await this.appContainer.apiv3.get('/security-setting/');
    const { ldapAuth } = response.data.securityParams;
    this.setState({
      isUserBind: ldapAuth.isUserBind,
      ldapBindDN: ldapAuth.ldapBindDN,
      ldapBindDNPassword: ldapAuth.ldapBindDNPassword,
      ldapSearchFilter: ldapAuth.ldapSearchFilter,
      ldapAttrMapUsername: ldapAuth.ldapAttrMapUsername,
      isSameUsernameTreatedAsIdenticalUser: ldapAuth.isSameUsernameTreatedAsIdenticalUser,
      ldapAttrMapMail: ldapAuth.ldapAttrMapMail,
      ldapAttrMapName: ldapAuth.ldapAttrMapName,
      ldapGroupSearchBase: ldapAuth.ldapGroupSearchBase,
      ldapGroupSearchFilter: ldapAuth.ldapGroupSearchFilter,
      ldapGroupDnProperty: ldapAuth.ldapGroupDnProperty,
    });
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
  changeLdapBindMode(isUserBind) {
    this.setState({ isUserBind });
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
   * Switch is same username treated as identical user
   */
  switchIsSameUsernameTreatedAsIdenticalUser() {
    this.setState({ isSameUsernameTreatedAsIdenticalUser: !this.state.isSameUsernameTreatedAsIdenticalUser });
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
