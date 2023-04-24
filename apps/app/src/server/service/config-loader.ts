import { envUtils } from '@growi/core';
import { parseISO } from 'date-fns';

import { GrowiServiceType } from '~/interfaces/questionnaire/growi-info';
import loggerFactory from '~/utils/logger';

import ConfigModel, {
  Config, defaultCrowiConfigs, defaultMarkdownConfigs, defaultNotificationConfigs,
} from '../models/config';


const logger = loggerFactory('growi:service:ConfigLoader');

enum ValueType { NUMBER, STRING, BOOLEAN, DATE }

interface ValueParser<T> {
  parse(value: string): T;
}

interface EnvConfig {
  ns: string,
  key: string,
  type: ValueType,
  default?: number | string | boolean | null,
}

type EnumDictionary<T extends string | symbol | number, U> = {
  [K in T]: U;
};

const parserDictionary: EnumDictionary<ValueType, ValueParser<number | string | boolean | Date>> = {
  [ValueType.NUMBER]:  { parse: (v: string) => { return parseInt(v, 10) } },
  [ValueType.STRING]:  { parse: (v: string) => { return v } },
  [ValueType.BOOLEAN]: { parse: (v: string) => { return envUtils.toBoolean(v) } },
  [ValueType.DATE]:    { parse: (v: string) => { return parseISO(v) } },
};

/**
 * The following env vars are excluded because these are currently used before the configuration setup.
 * - MONGO_URI
 * - NODE_ENV
 * - PORT
 * - REDIS_URI
 * - SESSION_NAME
 * - PASSWORD_SEED
 * - SECRET_TOKEN
 *
 *  The commented out item has not yet entered the migration work.
 *  So, parameters of these are under consideration.
 */
const ENV_VAR_NAME_TO_CONFIG_INFO = {
  FILE_UPLOAD: {
    ns:      'crowi',
    key:     'app:fileUploadType',
    type:    ValueType.STRING,
    default: 'aws',
  },
  FILE_UPLOAD_USES_ONLY_ENV_VAR_FOR_FILE_UPLOAD_TYPE: {
    ns:      'crowi',
    key:     'app:useOnlyEnvVarForFileUploadType',
    type:    ValueType.BOOLEAN,
    default: false,
  },
  HACKMD_URI: {
    ns:      'crowi',
    key:     'app:hackmdUri',
    type:    ValueType.STRING,
    default: null,
  },
  HACKMD_URI_FOR_SERVER: {
    ns:      'crowi',
    key:     'app:hackmdUriForServer',
    type:    ValueType.STRING,
    default: null,
  },
  // BLOCKDIAG_URI: {
  //   ns:      ,
  //   key:     ,
  //   type:    ,
  //   default:
  // },
  // OAUTH_GOOGLE_CLIENT_ID: {
  //   ns:      'crowi',
  //   key:     'security:passport-google:clientId',
  //   type:    ,
  //   default:
  // },
  // OAUTH_GOOGLE_CLIENT_SECRET: {
  //   ns:      'crowi',
  //   key:     'security:passport-google:clientSecret',
  //   type:    ,
  //   default:
  // },
  // OAUTH_GOOGLE_CALLBACK_URI: {
  //   ns:      'crowi',
  //   key:     'security:passport-google:callbackUrl',
  //   type:    ,
  //   default:
  // },
  // OAUTH_GITHUB_CLIENT_ID: {
  //   ns:      'crowi',
  //   key:     'security:passport-github:clientId',
  //   type:    ,
  //   default:
  // },
  // OAUTH_GITHUB_CLIENT_SECRET: {
  //   ns:      'crowi',
  //   key:     'security:passport-github:clientSecret',
  //   type:    ,
  //   default:
  // },
  // OAUTH_GITHUB_CALLBACK_URI: {
  //   ns:      'crowi',
  //   key:     'security:passport-github:callbackUrl',
  //   type:    ,
  //   default:
  // },
  PLANTUML_URI: {
    ns:      'crowi',
    key:     'app:plantumlUri',
    type:    ValueType.STRING,
    default: 'https://www.plantuml.com/plantuml',
  },
  DRAWIO_URI: {
    ns:      'crowi',
    key:     'app:drawioUri',
    type:    ValueType.STRING,
    default: 'https://embed.diagrams.net/',
  },
  NCHAN_URI: {
    ns:      'crowi',
    key:     'app:nchanUri',
    type:    ValueType.STRING,
    default: null,
  },
  APP_SITE_URL: {
    ns:      'crowi',
    key:     'app:siteUrl',
    type:    ValueType.STRING,
    default: null,
  },
  PUBLISH_OPEN_API: {
    ns:      'crowi',
    key:     'app:publishOpenAPI',
    type:    ValueType.BOOLEAN,
    default: false,
  },
  IS_V5_COMPATIBLE: {
    ns:      'crowi',
    key:     'app:isV5Compatible',
    type:    ValueType.BOOLEAN,
    default: undefined,
  },
  IS_MAINTENANCE_MODE: {
    ns:      'crowi',
    key:     'app:isMaintenanceMode',
    type:    ValueType.BOOLEAN,
    default: false,
  },
  AUTO_INSTALL_ADMIN_USERNAME: {
    ns:      'crowi',
    key:     'autoInstall:adminUsername',
    type:    ValueType.STRING,
    default: null,
  },
  AUTO_INSTALL_ADMIN_NAME: {
    ns:      'crowi',
    key:     'autoInstall:adminName',
    type:    ValueType.STRING,
    default: null,
  },
  AUTO_INSTALL_ADMIN_EMAIL: {
    ns:      'crowi',
    key:     'autoInstall:adminEmail',
    type:    ValueType.STRING,
    default: null,
  },
  AUTO_INSTALL_ADMIN_PASSWORD: {
    ns:      'crowi',
    key:     'autoInstall:adminPassword',
    type:    ValueType.STRING,
    default: null,
  },
  AUTO_INSTALL_GLOBAL_LANG: {
    ns:      'crowi',
    key:     'autoInstall:globalLang',
    type:    ValueType.STRING,
    default: null,
  },
  AUTO_INSTALL_ALLOW_GUEST_MODE: {
    ns:      'crowi',
    key:     'autoInstall:allowGuestMode',
    type:    ValueType.BOOLEAN,
    default: false,
  },
  AUTO_INSTALL_SERVER_DATE: {
    ns:      'crowi',
    key:     'autoInstall:serverDate',
    type:    ValueType.DATE,
    default: null,
  },
  S2SMSG_PUBSUB_SERVER_TYPE: {
    ns:      'crowi',
    key:     's2sMessagingPubsub:serverType',
    type:    ValueType.STRING,
    default: null,
  },
  S2SMSG_PUBSUB_NCHAN_PUBLISH_PATH: {
    ns:      'crowi',
    key:     's2sMessagingPubsub:nchan:publishPath',
    type:    ValueType.STRING,
    default: '/pubsub',
  },
  S2SMSG_PUBSUB_NCHAN_SUBSCRIBE_PATH: {
    ns:      'crowi',
    key:     's2sMessagingPubsub:nchan:subscribePath',
    type:    ValueType.STRING,
    default: '/pubsub',
  },
  S2SMSG_PUBSUB_NCHAN_CHANNEL_ID: {
    ns:      'crowi',
    key:     's2sMessagingPubsub:nchan:channelId',
    type:    ValueType.STRING,
    default: null,
  },
  S2CMSG_PUBSUB_CONNECTIONS_LIMIT: {
    ns:      'crowi',
    key:     's2cMessagingPubsub:connectionsLimit',
    type:    ValueType.NUMBER,
    default: 5000,
  },
  S2CMSG_PUBSUB_CONNECTIONS_LIMIT_FOR_ADMIN: {
    ns:      'crowi',
    key:     's2cMessagingPubsub:connectionsLimitForAdmin',
    type:    ValueType.NUMBER,
    default: 100,
  },
  S2CMSG_PUBSUB_CONNECTIONS_LIMIT_FOR_GUEST: {
    ns:      'crowi',
    key:     's2cMessagingPubsub:connectionsLimitForGuest',
    type:    ValueType.NUMBER,
    default: 2000,
  },
  MAX_FILE_SIZE: {
    ns:      'crowi',
    key:     'app:maxFileSize',
    type:    ValueType.NUMBER,
    default: Infinity,
  },
  FILE_UPLOAD_TOTAL_LIMIT: {
    ns:      'crowi',
    key:     'app:fileUploadTotalLimit',
    type:    ValueType.NUMBER,
    default: Infinity,
  },
  FILE_UPLOAD_DISABLED: {
    ns:      'crowi',
    key:     'app:fileUploadDisabled',
    type:    ValueType.BOOLEAN,
    default: false,
  },
  FILE_UPLOAD_LOCAL_USE_INTERNAL_REDIRECT: {
    ns:      'crowi',
    key:     'fileUpload:local:useInternalRedirect',
    type:    ValueType.BOOLEAN,
    default: false,
  },
  FILE_UPLOAD_LOCAL_INTERNAL_REDIRECT_PATH: {
    ns:      'crowi',
    key:     'fileUpload:local:internalRedirectPath',
    type:    ValueType.STRING,
    default: '/growi-internal/',
  },
  ELASTICSEARCH_VERSION: {
    ns:      'crowi',
    key:     'app:elasticsearchVersion',
    type:    ValueType.NUMBER,
    default: 7,
  },
  ELASTICSEARCH_URI: {
    ns:      'crowi',
    key:     'app:elasticsearchUri',
    type:    ValueType.STRING,
    default: null,
  },
  ELASTICSEARCH_REQUEST_TIMEOUT: {
    ns:      'crowi',
    key:     'app:elasticsearchRequestTimeout',
    type:    ValueType.NUMBER,
    default: 8000, // msec
  },
  ELASTICSEARCH_REJECT_UNAUTHORIZED: {
    ns:      'crowi',
    key:     'app:elasticsearchRejectUnauthorized',
    type:    ValueType.BOOLEAN,
    default: false,
  },
  ELASTICSEARCH_REINDEX_ON_BOOT: {
    ns:      'crowi',
    key:     'app:elasticsearchReindexOnBoot',
    type:    ValueType.BOOLEAN,
    default: false,
  },
  MONGO_GRIDFS_TOTAL_LIMIT: {
    ns:      'crowi',
    key:     'gridfs:totalLimit',
    type:    ValueType.NUMBER,
    default: null, // set null in default for backward compatibility
    //                cz: Newer system respects FILE_UPLOAD_TOTAL_LIMIT.
    //                    If the default value of MONGO_GRIDFS_TOTAL_LIMIT is Infinity,
    //                      the system can't distinguish between "not specified" and "Infinity is specified".
  },
  FORCE_WIKI_MODE: {
    ns:      'crowi',
    key:     'security:wikiMode',
    type:    ValueType.STRING,
    default: undefined,
  },
  SESSION_MAX_AGE: {
    ns:      'crowi',
    key:     'security:sessionMaxAge',
    type:    ValueType.NUMBER,
    default: undefined,
  },
  USER_UPPER_LIMIT: {
    ns:      'crowi',
    key:     'security:userUpperLimit',
    type:    ValueType.NUMBER,
    default: Infinity,
  },
  DISABLE_LINK_SHARING: {
    ns:      'crowi',
    key:     'security:disableSharing',
    type:    ValueType.BOOLEAN,
    default: false,
  },
  TRUST_PROXY_BOOL: {
    ns:      'crowi',
    key:     'security:trustProxyBool',
    type:    ValueType.BOOLEAN,
    default: null,
  },
  TRUST_PROXY_CSV: {
    ns:      'crowi',
    key:     'security:trustProxyCsv',
    type:    ValueType.STRING,
    default: null,
  },
  TRUST_PROXY_HOPS: {
    ns:      'crowi',
    key:     'security:trustProxyHops',
    type:    ValueType.NUMBER,
    default: null,
  },
  LOCAL_STRATEGY_ENABLED: {
    ns:      'crowi',
    key:     'security:passport-local:isEnabled',
    type:    ValueType.BOOLEAN,
    default: true,
  },
  LOCAL_STRATEGY_USES_ONLY_ENV_VARS_FOR_SOME_OPTIONS: {
    ns:      'crowi',
    key:     'security:passport-local:useOnlyEnvVarsForSomeOptions',
    type:    ValueType.BOOLEAN,
    default: false,
  },
  LOCAL_STRATEGY_PASSWORD_RESET_ENABLED: {
    ns:      'crowi',
    key:     'security:passport-local:isPasswordResetEnabled',
    type:    ValueType.BOOLEAN,
    default: true,
  },
  LOCAL_STRATEGY_EMAIL_AUTHENTICATION_ENABLED: {
    ns:      'crowi',
    key:     'security:passport-local:isEmailAuthenticationEnabled',
    type:    ValueType.BOOLEAN,
    default: false,
  },
  SAML_USES_ONLY_ENV_VARS_FOR_SOME_OPTIONS: {
    ns:      'crowi',
    key:     'security:passport-saml:useOnlyEnvVarsForSomeOptions',
    type:    ValueType.BOOLEAN,
    default: false,
  },
  SAML_ENABLED: {
    ns:      'crowi',
    key:     'security:passport-saml:isEnabled',
    type:    ValueType.BOOLEAN,
    default: null,
  },
  SAML_ENTRY_POINT: {
    ns:      'crowi',
    key:     'security:passport-saml:entryPoint',
    type:    ValueType.STRING,
    default: null,
  },
  SAML_CALLBACK_URI: {
    ns:      'crowi',
    key:     'security:passport-saml:callbackUrl',
    type:    ValueType.STRING,
    default: null,
  },
  SAML_ISSUER: {
    ns:      'crowi',
    key:     'security:passport-saml:issuer',
    type:    ValueType.STRING,
    default: null,
  },
  SAML_ATTR_MAPPING_ID: {
    ns:      'crowi',
    key:     'security:passport-saml:attrMapId',
    type:    ValueType.STRING,
    default: null,
  },
  SAML_ATTR_MAPPING_USERNAME: {
    ns:      'crowi',
    key:     'security:passport-saml:attrMapUsername',
    type:    ValueType.STRING,
    default: null,
  },
  SAML_ATTR_MAPPING_MAIL: {
    ns:      'crowi',
    key:     'security:passport-saml:attrMapMail',
    type:    ValueType.STRING,
    default: null,
  },
  SAML_ATTR_MAPPING_FIRST_NAME: {
    ns:      'crowi',
    key:     'security:passport-saml:attrMapFirstName',
    type:    ValueType.STRING,
    default: null,
  },
  SAML_ATTR_MAPPING_LAST_NAME: {
    ns:      'crowi',
    key:     'security:passport-saml:attrMapLastName',
    type:    ValueType.STRING,
    default: null,
  },
  SAML_CERT: {
    ns:      'crowi',
    key:     'security:passport-saml:cert',
    type:    ValueType.STRING,
    default: null,
  },
  SAML_ABLC_RULE: {
    ns:      'crowi',
    key:     'security:passport-saml:ABLCRule',
    type:    ValueType.STRING,
    default: null,
  },
  OIDC_TIMEOUT_MULTIPLIER: {
    ns:      'crowi',
    key:     'security:passport-oidc:timeoutMultiplier',
    type:    ValueType.NUMBER,
    default: 1.5,
  },
  OIDC_DISCOVERY_RETRIES: {
    ns:      'crowi',
    key:     'security:passport-oidc:discoveryRetries',
    type:    ValueType.NUMBER,
    default: 3,
  },
  OIDC_CLIENT_CLOCK_TOLERANCE: {
    ns: 'crowi',
    key: 'security:passport-oidc:oidcClientClockTolerance',
    type: ValueType.NUMBER,
    default: 60,
  },
  OIDC_ISSUER_TIMEOUT_OPTION: {
    ns: 'crowi',
    key: 'security:passport-oidc:oidcIssuerTimeoutOption',
    type: ValueType.NUMBER,
    default: 5000,
  },
  S3_REFERENCE_FILE_WITH_RELAY_MODE: {
    ns:      'crowi',
    key:     'aws:referenceFileWithRelayMode',
    type:    ValueType.BOOLEAN,
    default: false,
  },
  S3_LIFETIME_SEC_FOR_TEMPORARY_URL: {
    ns:      'crowi',
    key:     'aws:lifetimeSecForTemporaryUrl',
    type:    ValueType.NUMBER,
    default: 120,
  },
  GCS_API_KEY_JSON_PATH: {
    ns:      'crowi',
    key:     'gcs:apiKeyJsonPath',
    type:    ValueType.STRING,
    default: null,
  },
  GCS_BUCKET: {
    ns:      'crowi',
    key:     'gcs:bucket',
    type:    ValueType.STRING,
    default: null,
  },
  GCS_UPLOAD_NAMESPACE: {
    ns:      'crowi',
    key:     'gcs:uploadNamespace',
    type:    ValueType.STRING,
    default: null,
  },
  GCS_REFERENCE_FILE_WITH_RELAY_MODE: {
    ns:      'crowi',
    key:     'gcs:referenceFileWithRelayMode',
    type:    ValueType.BOOLEAN,
    default: false,
  },
  GCS_USES_ONLY_ENV_VARS_FOR_SOME_OPTIONS: {
    ns:      'crowi',
    key:     'gcs:useOnlyEnvVarsForSomeOptions',
    type:    ValueType.BOOLEAN,
    default: false,
  },
  GCS_LIFETIME_SEC_FOR_TEMPORARY_URL: {
    ns:      'crowi',
    key:     'gcs:lifetimeSecForTemporaryUrl',
    type:    ValueType.NUMBER,
    default: 120,
  },
  PROMSTER_ENABLED: {
    ns:      'crowi',
    key:     'promster:isEnabled',
    type:    ValueType.BOOLEAN,
    default: false,
  },
  PROMSTER_PORT: {
    ns:      'crowi',
    key:     'promster:port',
    type:    ValueType.NUMBER,
    default: 7788,
  },
  GROWI_CLOUD_URI: {
    ns:      'crowi',
    key:     'app:growiCloudUri',
    type:    ValueType.STRING,
    default: null,
  },
  GROWI_APP_ID_FOR_GROWI_CLOUD: {
    ns:      'crowi',
    key:     'app:growiAppIdForCloud',
    type:    ValueType.STRING,
    default: null,
  },
  DEFAULT_EMAIL_PUBLISHED: {
    ns:      'crowi',
    key:     'customize:isEmailPublishedForNewUser',
    type:    ValueType.BOOLEAN,
    default: true,
  },
  SLACKBOT_TYPE: {
    ns:      'crowi',
    key:     'slackbot:currentBotType', // enum SlackbotType
    type:    ValueType.STRING,
    default: null,
  },
  SLACKBOT_INTEGRATION_PROXY_URI: {
    ns:      'crowi',
    key:     'slackbot:proxyUri',
    type:    ValueType.STRING,
    default: null,
  },
  SLACKBOT_WITHOUT_PROXY_SIGNING_SECRET: {
    ns:      'crowi',
    key:     'slackbot:withoutProxy:signingSecret',
    type:    ValueType.STRING,
    default: null,
  },
  SLACKBOT_WITHOUT_PROXY_BOT_TOKEN: {
    ns:      'crowi',
    key:     'slackbot:withoutProxy:botToken',
    type:    ValueType.STRING,
    default: null,
  },
  SLACKBOT_WITHOUT_PROXY_COMMAND_PERMISSION: {
    ns:      'crowi',
    key:     'slackbot:withoutProxy:commandPermission',
    type:    ValueType.STRING,
    default: null,
  },
  SLACKBOT_WITHOUT_PROXY_EVENT_ACTIONS_PERMISSION: {
    ns:      'crowi',
    key:     'slackbot:withoutProxy:eventActionsPermission',
    type:    ValueType.STRING,
    default: null,
  },
  SLACKBOT_WITH_PROXY_SALT_FOR_GTOP: {
    ns:      'crowi',
    key:     'slackbot:withProxy:saltForGtoP',
    type:    ValueType.STRING,
    default: 'gtop',
  },
  SLACKBOT_WITH_PROXY_SALT_FOR_PTOG: {
    ns:      'crowi',
    key:     'slackbot:withProxy:saltForPtoG',
    type:    ValueType.STRING,
    default: 'ptog',
  },
  OGP_URI: {
    ns:      'crowi',
    key:     'app:ogpUri',
    type:    ValueType.STRING,
    default: null,
  },
  MIN_PASSWORD_LENGTH: {
    ns: 'crowi',
    key: 'app:minPasswordLength',
    type: ValueType.NUMBER,
    default: 8,
  },
  AUDIT_LOG_ENABLED: {
    ns: 'crowi',
    key: 'app:auditLogEnabled',
    type: ValueType.BOOLEAN,
    default: false,
  },
  ACTIVITY_EXPIRATION_SECONDS: {
    ns: 'crowi',
    key: 'app:activityExpirationSeconds',
    type: ValueType.NUMBER,
    default: 2592000, // 30 days
  },
  AUDIT_LOG_ACTION_GROUP_SIZE: {
    ns: 'crowi',
    key: 'app:auditLogActionGroupSize',
    type: ValueType.STRING,
    default: 'SMALL',
  },
  AUDIT_LOG_ADDITIONAL_ACTIONS: {
    ns: 'crowi',
    key: 'app:auditLogAdditionalActions',
    type: ValueType.STRING,
    default: null,
  },
  AUDIT_LOG_EXCLUDE_ACTIONS: {
    ns: 'crowi',
    key: 'app:auditLogExcludeActions',
    type: ValueType.STRING,
    default: null,
  },
  GROWI_QUESTIONNAIRE_SERVER_ORIGIN: {
    ns: 'crowi',
    key: 'app:growiQuestionnaireServerOrigin',
    type: ValueType.STRING,
    default: null,
  },
  QUESTIONNAIRE_CRON_SCHEDULE: {
    ns: 'crowi',
    key: 'app:questionnaireCronSchedule',
    type: ValueType.STRING,
    default: '0 22 * * *',
  },
  QUESTIONNAIRE_CRON_MAX_HOURS_UNTIL_REQUEST: {
    ns: 'crowi',
    key: 'app:questionnaireCronMaxHoursUntilRequest',
    type: ValueType.NUMBER,
    default: 4,
  },
  QUESTIONNAIRE_IS_ENABLE_QUESTIONNAIRE: {
    ns: 'crowi',
    key: 'questionnaire:isQuestionnaireEnabled',
    type: ValueType.BOOLEAN,
    default: true,
  },
  QUESTIONNAIRE_IS_APP_SITE_URL_HASHED: {
    ns: 'crowi',
    key: 'questionnaire:isAppSiteUrlHashed',
    type: ValueType.BOOLEAN,
    default: false,
  },
  SERVICE_TYPE: {
    ns: 'crowi',
    key: 'app:serviceType',
    type: ValueType.STRING,
    default: GrowiServiceType.onPremise,
  },
  DEPLOYMENT_TYPE: {
    ns: 'crowi',
    key: 'app:deploymentType',
    type: ValueType.STRING,
    default: null,
  },
};


/**
 * return whether env belongs to Security settings
 * @param key ex. 'security:passport-saml:isEnabled' is true
 * @returns
 */
const isSecurityEnv = (key) => {
  const array = key.split(':');
  return (array[0] === 'security');
};

export interface ConfigObject extends Record<string, any> {
  fromDB: any,
  fromEnvVars: any,
}

export default class ConfigLoader {

  /**
   * return a config object
   */
  async load(): Promise<ConfigObject> {
    const configFromDB: any = await this.loadFromDB();
    const configFromEnvVars: any = this.loadFromEnvVars();

    // merge defaults per ns
    const mergedConfigFromDB = {
      crowi: Object.assign(defaultCrowiConfigs, configFromDB.crowi),
      markdown: Object.assign(defaultMarkdownConfigs, configFromDB.markdown),
      notification: Object.assign(defaultNotificationConfigs, configFromDB.notification),
    };

    // In getConfig API, only null is used as a value to indicate that a config is not set.
    // So, if a value loaded from the database is empty,
    // it is converted to null because an empty string is used as the same meaning in the config model.
    // By this processing, whether a value is loaded from the database or from the environment variable,
    // only null indicates a config is not set.
    for (const namespace of Object.keys(mergedConfigFromDB)) {
      for (const key of Object.keys(mergedConfigFromDB[namespace])) {
        if (mergedConfigFromDB[namespace][key] === '') {
          mergedConfigFromDB[namespace][key] = null;
        }
      }
    }

    return {
      fromDB: mergedConfigFromDB,
      fromEnvVars: configFromEnvVars,
    };
  }

  async loadFromDB(): Promise<any> {
    const config = {};
    const docs: Config[] = await ConfigModel.find().exec();

    for (const doc of docs) {
      if (!config[doc.ns]) {
        config[doc.ns] = {};
      }
      config[doc.ns][doc.key] = doc.value ? JSON.parse(doc.value) : null;
    }

    logger.debug('ConfigLoader#loadFromDB', config);

    return config;
  }

  loadFromEnvVars(): any {
    const config = {};
    for (const ENV_VAR_NAME of Object.keys(ENV_VAR_NAME_TO_CONFIG_INFO)) {
      const configInfo = ENV_VAR_NAME_TO_CONFIG_INFO[ENV_VAR_NAME];
      if (config[configInfo.ns] === undefined) {
        config[configInfo.ns] = {};
      }

      if (process.env[ENV_VAR_NAME] === undefined) {
        config[configInfo.ns][configInfo.key] = configInfo.default;
      }
      else {
        const parser: ValueParser<number | string | boolean> = parserDictionary[configInfo.type];
        config[configInfo.ns][configInfo.key] = parser.parse(process.env[ENV_VAR_NAME] as string);
      }
    }

    logger.debug('ConfigLoader#loadFromEnvVars', config);

    return config;
  }

  /**
   * get config from the environment variables for display admin page
   *
   * **use this only admin home page.**
   */
  static getEnvVarsForDisplay(avoidSecurity = false): any {
    const config = {};
    for (const ENV_VAR_NAME of Object.keys(ENV_VAR_NAME_TO_CONFIG_INFO)) {
      const configInfo = ENV_VAR_NAME_TO_CONFIG_INFO[ENV_VAR_NAME];
      if (process.env[ENV_VAR_NAME] === undefined) {
        continue;
      }
      if (isSecurityEnv(configInfo.key) && avoidSecurity) {
        continue;
      }
      const parser: ValueParser<number | string | boolean> = parserDictionary[configInfo.type];
      config[ENV_VAR_NAME] = parser.parse(process.env[ENV_VAR_NAME] as string);
    }

    logger.debug('ConfigLoader#getEnvVarsForDisplay', config);
    return config;
  }

}
