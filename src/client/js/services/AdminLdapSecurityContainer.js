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
      isUserBind: ldapAuth.isUserBind || false,
      ldapBindDN: ldapAuth.ldapBindDN || '',
      ldapBindDNPassword: ldapAuth.ldapBindDNPassword || '',
      ldapSearchFilter: ldapAuth.ldapSearchFilter || '',
      ldapAttrMapUsername: ldapAuth.ldapAttrMapUsername || '',
      isSameUsernameTreatedAsIdenticalUser: ldapAuth.isSameUsernameTreatedAsIdenticalUser || false,
      ldapAttrMapMail: ldapAuth.ldapAttrMapMail || '',
      ldapAttrMapName: ldapAuth.ldapAttrMapName || '',
      ldapGroupSearchBase: ldapAuth.ldapGroupSearchBase || '',
      ldapGroupSearchFilter: ldapAuth.ldapGroupSearchFilter || '',
      ldapGroupDnProperty: ldapAuth.ldapGroupDnProperty || '',
    });
  }


  /**
   * Workaround for the mangling in production build to break constructor.name
   */
  static getClassName() {
    return 'AdminLdapSecurityContainer';
  }

  /**
   * Change serverUrl
   */
  changeServerUrl(serverUrl) {
    this.setState({ serverUrl });
  }

  /**
   * Change ldapBindMode
   */
  changeLdapBindMode() {
    this.setState({ isUserBind: !this.state.isUserBind });
  }

  /**
   * Change bindDN
   */
  changeBindDN(ldapBindDN) {
    this.setState({ ldapBindDN });
  }

  /**
   * Change bindDNPassword
   */
  changeBindDNPassword(ldapBindDNPassword) {
    this.setState({ ldapBindDNPassword });
  }

  /**
   * Change ldapSearchFilter
   */
  changeSearchFilter(ldapSearchFilter) {
    this.setState({ ldapSearchFilter });
  }

  /**
   * Change ldapAttrMapUsername
   */
  changeAttrMapUsername(ldapAttrMapUsername) {
    this.setState({ ldapAttrMapUsername });
  }

  /**
   * Switch is same username treated as identical user
   */
  switchIsSameUsernameTreatedAsIdenticalUser() {
    this.setState({ isSameUsernameTreatedAsIdenticalUser: !this.state.isSameUsernameTreatedAsIdenticalUser });
  }

  /**
   * Change ldapAttrMapMail
   */
  changeAttrMapMail(ldapAttrMapMail) {
    this.setState({ ldapAttrMapMail });
  }

  /**
   * Change ldapAttrMapName
   */
  changeAttrMapName(ldapAttrMapName) {
    this.setState({ ldapAttrMapName });
  }

  /**
   * Change ldapGroupSearchBase
   */
  changeGroupSearchBase(ldapGroupSearchBase) {
    this.setState({ ldapGroupSearchBase });
  }

  /**
   * Change ldapGroupSearchFilter
   */
  changeGroupSearchFilter(ldapGroupSearchFilter) {
    this.setState({ ldapGroupSearchFilter });
  }

  /**
   * Change ldapGroupDnProperty
   */
  changeGroupDnProperty(ldapGroupDnProperty) {
    this.setState({ ldapGroupDnProperty });
  }

  /**
   * Update ldap option
   */
  async updateLdapSetting() {

    const response = await this.appContainer.apiv3.put('/security-setting/ldap', {
      isUserBind: this.state.isUserBind,
      ldapBindDN: this.state.ldapBindDN,
      ldapBindDNPassword: this.state.ldapBindDNPassword,
      ldapSearchFilter: this.state.ldapSearchFilter,
      ldapAttrMapUsername: this.state.ldapAttrMapUsername,
      isSameUsernameTreatedAsIdenticalUser: this.state.isSameUsernameTreatedAsIdenticalUser,
      ldapAttrMapMail: this.state.ldapAttrMapMail,
      ldapAttrMapName: this.state.ldapAttrMapName,
      ldapGroupSearchBase: this.state.ldapGroupSearchBase,
      ldapGroupSearchFilter: this.state.ldapGroupSearchFilter,
      ldapGroupDnProperty: this.state.ldapGroupDnProperty,
    });

    const { securitySettingParams } = response.data;

    this.setState({
      isUserBind: securitySettingParams.isUserBind || false,
      ldapBindDN: securitySettingParams.ldapBindDN || '',
      ldapBindDNPassword: securitySettingParams.ldapBindDNPassword || '',
      ldapSearchFilter: securitySettingParams.ldapSearchFilter || '',
      ldapAttrMapUsername: securitySettingParams.ldapAttrMapUsername || '',
      isSameUsernameTreatedAsIdenticalUser: securitySettingParams.isSameUsernameTreatedAsIdenticalUser || false,
      ldapAttrMapMail: securitySettingParams.ldapAttrMapMail || '',
      ldapAttrMapName: securitySettingParams.ldapAttrMapName || '',
      ldapGroupSearchBase: securitySettingParams.ldapGroupSearchBase || '',
      ldapGroupSearchFilter: securitySettingParams.ldapGroupSearchFilter || '',
      ldapGroupDnProperty: securitySettingParams.ldapGroupDnProperty || '',
    });
    return response;
  }

}
