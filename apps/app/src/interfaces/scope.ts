// If you want to add a new scope, you only need to add a new key to the ORIGINAL_SCOPE object.
export const ORIGINAL_SCOPE = {
  admin: {
    top: {},
    app: {},
    security: {},
    markdown: {},
    customize: {},
    import_data: {},
    exporet_data: {},
    data_transfer: {},
    external_notification: {},
    slack_integration: {},
    legacy_slack_integration: {},
    user_management: {},
    user_group_management: {},
    audit_log: {},
    plugin: {},
    ai_integration: {},
    full_text_search: {},
  },
  user: {
    info: {},
    external_account: {},
    password: {},
    api: {
      api_token: {},
      access_token: {},
    },
    in_app_notification: {},
    other: {},
  },
  base: {
  },
} as const;

export const ACTION = {
  READ: 'read',
  WRITE: 'write',
} as const;

type ACTION_TYPE = typeof ACTION[keyof typeof ACTION];
export const ALL_SIGN = '*';

export const ORIGINAL_SCOPE_WITH_ACTION = Object.values(ACTION).reduce(
  (acc, action) => {
    acc[action] = ORIGINAL_SCOPE;
    return acc;
  },
  {} as Record<ACTION_TYPE, typeof ORIGINAL_SCOPE>,
);

type FlattenObject<T> = {
  [K in keyof T]: T[K] extends object
    ? (keyof T[K] extends never
      ? K
      : `${K & string}:${FlattenObject<T[K]> & string}`)
    : K
}[keyof T];

type AddAllToScope<S extends string> =
  S extends `${infer X}:${infer Y}`
    ? `${X}:${typeof ALL_SIGN}` | `${X}:${AddAllToScope<Y>}` | S
    : S;

type ScopeOnly = FlattenObject<typeof ORIGINAL_SCOPE_WITH_ACTION>;
type ScopeWithAll = AddAllToScope<ScopeOnly> ;
export type Scope = ScopeOnly | ScopeWithAll;

// ScopeConstantsの型定義
type ScopeConstantLeaf = Scope;

type ScopeConstantNode<T> = {
  [K in keyof T as Uppercase<string & K>]: T[K] extends object
    ? (keyof T[K] extends never
      ? ScopeConstantLeaf
      : ScopeConstantNode<T[K]> & { ALL: Scope })
    : ScopeConstantLeaf
};

type ScopeConstantType = {
  [A in keyof typeof ORIGINAL_SCOPE_WITH_ACTION as Uppercase<string & A>]:
    ScopeConstantNode<typeof ORIGINAL_SCOPE> & { ALL: Scope }
};

const buildScopeConstants = (): ScopeConstantType => {
  const result = {} as Partial<ScopeConstantType>;

  const processObject = (obj: Record<string, any>, path: string[] = [], resultObj: Record<string, any>) => {
    Object.entries(obj).forEach(([key, value]) => {
      const upperKey = key.toUpperCase();
      const currentPath = [...path, key];
      const scopePath = currentPath.join(':');

      if (value == null) {
        return;
      }

      if (typeof value === 'object' && Object.keys(value).length === 0) {
        resultObj[upperKey] = `${scopePath}` as Scope;
      }
      else if (typeof value === 'object') {
        resultObj[upperKey] = {
          ALL: `${scopePath}:${ALL_SIGN}` as Scope,
        };

        processObject(value, currentPath, resultObj[upperKey]);
      }
    });
  };
  processObject(ORIGINAL_SCOPE_WITH_ACTION, [], result);

  return result as ScopeConstantType;
};

export const SCOPE = buildScopeConstants();


export const isValidScope = (scope: string): boolean => {
  const scopeParts = scope.split(':').map(x => (x === '*' ? 'ALL' : x.toUpperCase()));
  let obj: any = SCOPE;
  scopeParts.forEach((part) => {
    if (obj[part] == null) {
      return false;
    }
    obj = obj[part];
  });
  return obj === scope;
};

export const isAllScope = (scope: string): scope is Scope => {
  return scope.endsWith(`:${ALL_SIGN}`);
};

const getAllScopeValues = (scopeObj: any): Scope[] => {
  const result: Scope[] = [];

  const traverse = (current: any): void => {
    if (typeof current !== 'object' || current === null) {
      if (typeof current === 'string') {
        result.push(current as Scope);
      }
      return;
    }
    Object.values(current).forEach((value) => {
      traverse(value);
    });
  };
  traverse(scopeObj);
  return result;
};

export const extractScopes = (scopes?: Scope[]): Scope[] => {
  if (scopes == null) {
    return [];
  }
  const result = new Set<Scope>(scopes);
  scopes.forEach((scope) => {
    if (!isAllScope(scope)) {
      return;
    }
    const scopeParts = scope.split(':').map(x => (x.toUpperCase()));
    let obj: any = SCOPE;
    scopeParts.forEach((part) => {
      if (part === ALL_SIGN) {
        return;
      }
      obj = obj[part];
    });
    getAllScopeValues(obj).forEach((value) => {
      result.add(value);
    });
  });
  return Array.from(result.values());
};
