import {
  ACTION, ALL_SIGN, SCOPE, type Scope,
} from '../../interfaces/scope';

export const isValidScope = (scope: Scope): boolean => {
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

export const hasAllScope = (scope: Scope): scope is Scope => {
  return scope.endsWith(`:${ALL_SIGN}`);
};

/**
 * Returns all values of the scope object
 * For example, SCOPE.READ.USER.API.ALL returns ['read:user:api:access_token', 'read:user:api:api_token']
 */
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

/**
 * Returns all implied scopes for a given scope
 * For example, WRITE permission implies READ permission
 */
const getImpliedScopes = (scope: Scope): Scope[] => {
  const scopeParts = scope.split(':');
  if (scopeParts[0] === ACTION.READ) {
    return [scope];
  }
  if (scopeParts[0] === ACTION.WRITE) {
    return [scope, `${ACTION.READ}:${scopeParts.slice(1).join(':')}` as Scope];
  }
  return [];
};


/**
 * Extracts all scopes from a given array of scopes
 * And delete all scopes
 * For example, ['write:user:api:all']
 * returns ['read:user:api:access_token',
 *          'read:user:api:api_token'
 *          'write:user:api:access_token',
 *        'write:user:api:api_token']
 */
export const extractScopes = (scopes?: Scope[]): Scope[] => {
  if (scopes == null) {
    return [];
  }
  const result = new Set<Scope>(); // remove duplicates
  const impliedScopes = new Set<Scope>();
  scopes.forEach((scope) => {
    getImpliedScopes(scope).forEach((impliedScope) => {
      impliedScopes.add(impliedScope);
    });
  });
  impliedScopes.forEach((scope) => {
    if (!hasAllScope(scope)) {
      result.add(scope);
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
  const resultArray = Array.from(result.values());
  resultArray.filter(scope => !hasAllScope(scope));
  return resultArray;
};
