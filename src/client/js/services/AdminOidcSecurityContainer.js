import { Container } from 'unstated';
import loggerFactory from '@alias/logger';

import { pathUtils } from 'growi-commons';
import urljoin from 'url-join';
import removeNullPropertyFromObject from '../../../lib/util/removeNullPropertyFromObject';

const logger = loggerFactory('growi:services:AdminLdapSecurityContainer');

/**
 * Service container for admin security page (OidcSecurityManagement.jsx)
 * @extends {Container} unstated Container
 */
export default class AdminOidcSecurityContainer extends Container {

  constructor(appContainer) {
    super();

    this.appContainer = appContainer;
    this.dummyOidcProviderName = 0;
    this.dummyOidcProviderNameForError = 1;

    this.state = {
      retrieveError: null,
      callbackUrl: urljoin(pathUtils.removeTrailingSlash(appContainer.config.crowi.url), '/passport/oidc/callback'),
      // set dummy value tile for using suspense
      oidcProviderName: this.dummyOidcProviderName,
      oidcIssuerHost: '',
      oidcAuthorizationEndpoint: '',
      oidcTokenEndpoint: '',
      oidcRevocationEndpoint: '',
      oidcIntrospectionEndpoint: '',
      oidcUserInfoEndpoint: '',
      oidcEndSessionEndpoint: '',
      oidcRegistrationEndpoint: '',
      oidcJWKSUri: '',
      oidcClientId: '',
      oidcClientSecret: '',
      oidcAttrMapId: '',
      oidcAttrMapUserName: '',
      oidcAttrMapName: '',
      oidcAttrMapEmail: '',
      isSameUsernameTreatedAsIdenticalUser: false,
      isSameEmailTreatedAsIdenticalUser: false,
    };

  }

  /**
   * retrieve security data
   */
  async retrieveSecurityData() {
    try {
      const response = await this.appContainer.apiv3.get('/security-setting/');
      const { oidcAuth } = response.data.securityParams;
      this.setState({
        oidcProviderName: oidcAuth.oidcProviderName,
        oidcIssuerHost: oidcAuth.oidcIssuerHost,
        oidcAuthorizationEndpoint: oidcAuth.oidcAuthorizationEndpoint,
        oidcTokenEndpoint: oidcAuth.oidcTokenEndpoint,
        oidcRevocationEndpoint: oidcAuth.oidcRevocationEndpoint,
        oidcIntrospectionEndpoint: oidcAuth.oidcIntrospectionEndpoint,
        oidcUserInfoEndpoint: oidcAuth.oidcUserInfoEndpoint,
        oidcEndSessionEndpoint: oidcAuth.oidcEndSessionEndpoint,
        oidcRegistrationEndpoint: oidcAuth.oidcRegistrationEndpoint,
        oidcJWKSUri: oidcAuth.oidcJWKSUri,
        oidcClientId: oidcAuth.oidcClientId,
        oidcClientSecret: oidcAuth.oidcClientSecret,
        oidcAttrMapId: oidcAuth.oidcAttrMapId,
        oidcAttrMapUserName: oidcAuth.oidcAttrMapUserName,
        oidcAttrMapName: oidcAuth.oidcAttrMapName,
        oidcAttrMapEmail: oidcAuth.oidcAttrMapEmail,
        isSameUsernameTreatedAsIdenticalUser: oidcAuth.isSameUsernameTreatedAsIdenticalUser,
        isSameEmailTreatedAsIdenticalUser: oidcAuth.isSameEmailTreatedAsIdenticalUser,
      });
    }
    catch (err) {
      this.setState({ retrieveError: err });
      logger.error(err);
      throw new Error('Failed to fetch data');
    }
  }

  /**
   * Workaround for the mangling in production build to break constructor.name
   */
  static getClassName() {
    return 'AdminOidcSecurityContainer';
  }

  /**
   * Change oidcProviderName
   */
  changeOidcProviderName(inputValue) {
    this.setState({ oidcProviderName: inputValue });
  }

  /**
   * Change oidcIssuerHost
   */
  changeOidcIssuerHost(inputValue) {
    this.setState({ oidcIssuerHost: inputValue });
  }

  /**
   * Change oidcAuthorizationEndpoint
   */
  changeOidcAuthorizationEndpoint(inputValue) {
    this.setState({ oidcAuthorizationEndpoint: inputValue });
  }

  /**
   * Change oidcTokenEndpoint
   */
  changeOidcTokenEndpoint(inputValue) {
    this.setState({ oidcTokenEndpoint: inputValue });
  }

  /**
   * Change oidcRevocationEndpoint
   */
  changeOidcRevocationEndpoint(inputValue) {
    this.setState({ oidcRevocationEndpoint: inputValue });
  }

  /**
   * Change oidcIntrospectionEndpoint
   */
  changeOidcIntrospectionEndpoint(inputValue) {
    this.setState({ oidcIntrospectionEndpoint: inputValue });
  }

  /**
   * Change oidcUserInfoEndpoint
   */
  changeOidcUserInfoEndpoint(inputValue) {
    this.setState({ oidcUserInfoEndpoint: inputValue });
  }

  /**
   * Change oidcEndSessionEndpoint
   */
  changeOidcEndSessionEndpoint(inputValue) {
    this.setState({ oidcEndSessionEndpoint: inputValue });
  }

  /**
   * Change oidcRegistrationEndpoint
   */
  changeOidcRegistrationEndpoint(inputValue) {
    this.setState({ oidcRegistrationEndpoint: inputValue });
  }

  /**
   * Change oidcJWKSUri
   */
  changeOidcJWKSUri(inputValue) {
    this.setState({ oidcJWKSUri: inputValue });
  }

  /**
   * Change oidcClientId
   */
  changeOidcClientId(inputValue) {
    this.setState({ oidcClientId: inputValue });
  }

  /**
   * Change oidcClientSecret
   */
  changeOidcClientSecret(inputValue) {
    this.setState({ oidcClientSecret: inputValue });
  }

  /**
   * Change oidcAttrMapId
   */
  changeOidcAttrMapId(inputValue) {
    this.setState({ oidcAttrMapId: inputValue });
  }

  /**
   * Change oidcAttrMapUserName
   */
  changeOidcAttrMapUserName(inputValue) {
    this.setState({ oidcAttrMapUserName: inputValue });
  }

  /**
   * Change oidcAttrMapName
   */
  changeOidcAttrMapName(inputValue) {
    this.setState({ oidcAttrMapName: inputValue });
  }

  /**
   * Change oidcAttrMapEmail
   */
  changeOidcAttrMapEmail(inputValue) {
    this.setState({ oidcAttrMapEmail: inputValue });
  }

  /**
   * Switch sameUsernameTreatedAsIdenticalUser
   */
  switchIsSameUsernameTreatedAsIdenticalUser() {
    this.setState({ isSameUsernameTreatedAsIdenticalUser: !this.state.isSameUsernameTreatedAsIdenticalUser });
  }

  /**
   * Switch sameEmailTreatedAsIdenticalUser
   */
  switchIsSameEmailTreatedAsIdenticalUser() {
    this.setState({ isSameEmailTreatedAsIdenticalUser: !this.state.isSameEmailTreatedAsIdenticalUser });
  }

  /**
   * Update OpenID Connect
   */
  async updateOidcSetting() {
    const {
      oidcProviderName,
      oidcIssuerHost,
      oidcAuthorizationEndpoint,
      oidcTokenEndpoint,
      oidcRevocationEndpoint,
      oidcIntrospectionEndpoint,
      oidcUserInfoEndpoint,
      oidcEndSessionEndpoint,
      oidcRegistrationEndpoint,
      oidcJWKSUri,
      oidcClientId,
      oidcClientSecret,
      oidcAttrMapId,
      oidcAttrMapUserName,
      oidcAttrMapName,
      oidcAttrMapEmail,
      isSameUsernameTreatedAsIdenticalUser,
      isSameEmailTreatedAsIdenticalUser,
    } = this.state;

    let requestParams = {
      oidcProviderName,
      oidcIssuerHost,
      oidcAuthorizationEndpoint,
      oidcTokenEndpoint,
      oidcRevocationEndpoint,
      oidcIntrospectionEndpoint,
      oidcUserInfoEndpoint,
      oidcEndSessionEndpoint,
      oidcRegistrationEndpoint,
      oidcJWKSUri,
      oidcClientId,
      oidcClientSecret,
      oidcAttrMapId,
      oidcAttrMapUserName,
      oidcAttrMapName,
      oidcAttrMapEmail,
      isSameUsernameTreatedAsIdenticalUser,
      isSameEmailTreatedAsIdenticalUser,
    };

    requestParams = await removeNullPropertyFromObject(requestParams);
    const response = await this.appContainer.apiv3.put('/security-setting/oidc', requestParams);
    const { securitySettingParams } = response.data;

    this.setState({
      oidcProviderName: securitySettingParams.oidcProviderName,
      oidcIssuerHost: securitySettingParams.oidcIssuerHost,
      oidcAuthorizationEndpoint: securitySettingParams.oidcAuthorizationEndpoint,
      oidcTokenEndpoint: securitySettingParams.oidcTokenEndpoint,
      oidcRevocationEndpoint: securitySettingParams.oidcRevocationEndpoint,
      oidcIntrospectionEndpoint: securitySettingParams.oidcIntrospectionEndpoint,
      oidcUserInfoEndpoint: securitySettingParams.oidcUserInfoEndpoint,
      oidcEndSessionEndpoint: securitySettingParams.oidcEndSessionEndpoint,
      oidcRegistrationEndpoint: securitySettingParams.oidcRegistrationEndpoint,
      oidcJWKSUri: securitySettingParams.oidcJWKSUri,
      oidcClientId: securitySettingParams.oidcClientId,
      oidcClientSecret: securitySettingParams.oidcClientSecret,
      oidcAttrMapId: securitySettingParams.oidcAttrMapId,
      oidcAttrMapUserName: securitySettingParams.oidcAttrMapUserName,
      oidcAttrMapName: securitySettingParams.oidcAttrMapName,
      oidcAttrMapEmail: securitySettingParams.oidcAttrMapEmail,
      isSameUsernameTreatedAsIdenticalUser: securitySettingParams.isSameUsernameTreatedAsIdenticalUser,
      isSameEmailTreatedAsIdenticalUser: securitySettingParams.isSameEmailTreatedAsIdenticalUser,
    });
    return response;
  }

}
