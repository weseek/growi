import { PresetThemes } from '@growi/preset-themes';
import { Types, Schema } from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';

import { RehypeSanitizeOption } from '../../interfaces/rehype';
import { getOrCreateModel } from '../util/mongoose-utils';


export interface Config {
  _id: Types.ObjectId;
  ns: string;
  key: string;
  value: string;
  createdAt: Date;
}

/*
 * define methods type
 */
interface ModelMethods { any }


const schema = new Schema<Config>({
  ns: { type: String, required: true },
  key: { type: String, required: true },
  value: { type: String, required: true },
}, {
  timestamps: true,
});

// define unique compound index
schema.index({ ns: 1, key: 1 }, { unique: true });
schema.plugin(uniqueValidator);

/**
 * default values when GROWI is cleanly installed
 */
export const generateConfigsForInstalling = (): { [key: string]: any } => {
  // eslint-disable-next-line no-use-before-define
  const config = defaultCrowiConfigs;

  // overwrite
  config['app:installed'] = true;
  config['app:fileUpload'] = true;
  config['app:isV5Compatible'] = true;

  return config;
};

/**
 * default values when migrated from Official Crowi
 */
export const defaultCrowiConfigs: { [key: string]: any } = {
  /* eslint-disable key-spacing */
  'app:installed'     : false,
  'app:confidential'  : undefined,

  'app:fileUpload'    : false,
  'app:globalLang'    : 'en_US',

  'security:restrictGuestMode'      : 'Deny',

  'security:registrationMode'      : 'Open',
  'security:registrationWhitelist' : [],

  'security:list-policy:hideRestrictedByOwner' : false,
  'security:list-policy:hideRestrictedByGroup' : false,
  // DEPRECATED: 'security:pageCompleteDeletionAuthority' : undefined,
  'security:pageDeletionAuthority' : undefined,
  'security:pageCompleteDeletionAuthority' : undefined,
  'security:pageRecursiveDeletionAuthority' : undefined,
  'security:pageRecursiveCompleteDeletionAuthority' : undefined,
  'security:disableLinkSharing' : false,
  'security:isUsersHomepageDeletionEnabled': false,

  'security:passport-local:isEnabled' : true,
  'security:passport-ldap:isEnabled' : false,
  'security:passport-ldap:serverUrl' : undefined,
  'security:passport-ldap:isUserBind' : undefined,
  'security:passport-ldap:bindDN' : undefined,
  'security:passport-ldap:bindDNPassword' : undefined,
  'security:passport-ldap:searchFilter' : undefined,
  'security:passport-ldap:attrMapUsername' : undefined,
  'security:passport-ldap:attrMapName' : undefined,
  'security:passport-ldap:attrMapMail' : undefined,
  'security:passport-ldap:groupSearchBase' : undefined,
  'security:passport-ldap:groupSearchFilter' : undefined,
  'security:passport-ldap:groupDnProperty' : undefined,
  'security:passport-ldap:isSameUsernameTreatedAsIdenticalUser': false,
  'security:passport-saml:isEnabled' : false,
  'security:passport-saml:isSameEmailTreatedAsIdenticalUser': false,

  'security:passport-google:isEnabled' : false,
  'security:passport-google:clientId': undefined,
  'security:passport-google:clientSecret': undefined,
  'security:passport-google:isSameUsernameTreatedAsIdenticalUser': false,

  'security:passport-github:isEnabled' : false,
  'security:passport-github:clientId': undefined,
  'security:passport-github:clientSecret': undefined,
  'security:passport-github:isSameUsernameTreatedAsIdenticalUser': false,

  'security:passport-oidc:isEnabled' : false,

  'aws:s3Bucket'          : 'growi',
  'aws:s3Region'          : 'ap-northeast-1',
  'aws:s3AccessKeyId'     : undefined,
  'aws:s3SecretAccessKey' : undefined,
  'aws:s3CustomEndpoint'  : undefined,

  'mail:from'         : undefined,
  'mail:smtpHost'     : undefined,
  'mail:smtpPort'     : undefined,
  'mail:smtpUser'     : undefined,
  'mail:smtpPassword' : undefined,

  'customize:css' : undefined,
  'customize:script' : undefined,
  'customize:noscript' : undefined,
  'customize:title' : undefined,
  'customize:highlightJsStyle' : 'github',
  'customize:highlightJsStyleBorder' : false,
  'customize:theme' : PresetThemes.DEFAULT,
  'customize:theme:forcedColorScheme' : null,
  'customize:isContainerFluid' : false,
  'customize:isEnabledTimeline' : true,
  'customize:isEnabledAttachTitleHeader' : false,
  'customize:showPageLimitationS' : 20,
  'customize:showPageLimitationM' : 10,
  'customize:showPageLimitationL' : 50,
  'customize:showPageLimitationXL' : 20,
  'customize:isEnabledStaleNotification': false,
  'customize:isAllReplyShown': false,
  'customize:isSearchScopeChildrenAsDefault': false,
  'customize:isSidebarDrawerMode': false,
  'customize:isSidebarClosedAtDockMode': false,

  'notification:owner-page:isEnabled': false,
  'notification:group-page:isEnabled': false,

  'importer:esa:team_name': undefined,
  'importer:esa:access_token': undefined,
  'importer:qiita:team_name': undefined,
  'importer:qiita:access_token': undefined,
  /* eslint-enable key-spacing */
};

export const defaultMarkdownConfigs: { [key: string]: any } = {
  // don't use it, but won't turn it off
  'markdown:xss:tagWhitelist': [],
  'markdown:xss:attrWhitelist': [],

  'markdown:rehypeSanitize:isEnabledPrevention': true,
  'markdown:rehypeSanitize:option': RehypeSanitizeOption.RECOMMENDED,
  'markdown:rehypeSanitize:tagNames': [],
  'markdown:rehypeSanitize:attributes': '{}',
  'markdown:isEnabledLinebreaks': false,
  'markdown:isEnabledLinebreaksInComments': true,
  'markdown:adminPreferredIndentSize': 4,
  'markdown:isIndentSizeForced': false,
};

export const defaultNotificationConfigs: { [key: string]: any } = {
  'slack:isIncomingWebhookPrioritized': false,
  'slack:incomingWebhookUrl': undefined,
  'slack:token': undefined,
};

export default getOrCreateModel<Config, ModelMethods>('Config', schema);
