
// Data structure for the final merged scopes
interface ScopeMap {
  [key: string]: string | ScopeMap;
}

// Input object with arbitrary action keys (e.g., READ, WRITE)
type ScopesInput = Record<string, any>;


function parseSubScope(
    parentKey: string,
    subObjForActions: Record<string, any>,
    actions: string[],
): ScopeMap {
  const result: ScopeMap = {};

  for (const action of actions) {
    if (typeof subObjForActions[action] === 'string') {
      result[`${action.toLowerCase()}:${parentKey.toLowerCase()}:all`] = subObjForActions[action];
      subObjForActions[action] = undefined;
    }
  }

  const childKeys = new Set<string>();
  for (const action of actions) {
    const obj = subObjForActions[action];
    if (obj && typeof obj === 'object') {
      Object.keys(obj).forEach(k => childKeys.add(k));
    }
  }

  for (const ck of childKeys) {
    if (ck === 'ALL') {
      for (const action of actions) {
        const val = subObjForActions[action]?.[ck];
        if (typeof val === 'string') {
          result[`${action.toLowerCase()}:${parentKey.toLowerCase()}:all`] = val;
        }
      }
      continue;
    }

    const newKey = `${parentKey}:${ck}`;
    const childSubObj: Record<string, any> = {};
    for (const action of actions) {
      childSubObj[action] = subObjForActions[action]?.[ck];
    }

    result[newKey] = parseSubScope(newKey, childSubObj, actions);
  }

  return result;
}

export function parseScopes(scopes: ScopesInput): ScopeMap {
  const actions = Object.keys(scopes);
  const topKeys = new Set<string>();

  // Collect all top-level keys (e.g., ALL, ADMIN, USER) across all actions
  for (const action of actions) {
    Object.keys(scopes[action] || {}).forEach(k => topKeys.add(k));
  }

  const result: ScopeMap = {};

  for (const key of topKeys) {
    if (key === 'ALL') {
      const allObj: ScopeMap = {};
      for (const action of actions) {
        const val = scopes[action]?.[key];
        if (typeof val === 'string') {
          allObj[`${action.toLowerCase()}:all`] = val;
        }
      }
      result.ALL = allObj;
    }
    else {
      const subObjForActions: Record<string, any> = {};
      for (const action of actions) {
        subObjForActions[action] = scopes[action]?.[key];
      }
      result[key] = parseSubScope(key, subObjForActions, actions);
    }
  }

  return result;
}
