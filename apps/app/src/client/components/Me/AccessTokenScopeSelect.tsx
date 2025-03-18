import React, { useEffect, useState } from 'react';

import type { UseFormRegisterReturn } from 'react-hook-form';

import { parseScopes } from '~/client/util/scope-util';

import type { Scope } from '../../../interfaces/scope';
import { SCOPE } from '../../../interfaces/scope';

import { AccessTokenScopeList } from './AccessTokenScopeList';

/**
 * Props for AccessTokenScopeSelect
 */
type AccessTokenScopeSelectProps = {
  /** React Hook Form's register function for a field named "scopes" */
  register: UseFormRegisterReturn<'scopes'>;
  watch: Scope[];
};

/**
 * Displays a list of permissions in a recursive, nested checkbox interface.
 */
export const AccessTokenScopeSelect: React.FC<AccessTokenScopeSelectProps> = ({ register, watch }) => {
  const [disabledScopes, setDisabledScopes] = useState<Set<string>>(new Set());
  const ScopesMap = parseScopes({ scopes: SCOPE, isAdmin: false });

  const extractScopes = (obj: Record<string, any>): string[] => {
    let result: string[] = [];

    Object.values(obj).forEach((value) => {
      if (typeof value === 'string') {
        result.push(value);
      }
      else if (typeof value === 'object' && !Array.isArray(value)) {
        result = result.concat(extractScopes(value));
      }
    });

    return result;
  };
  const Scopes: string[] = extractScopes(ScopesMap);

  useEffect(() => {
    const selectedScopes = watch || [];

    // Create a set of scopes to disable based on prefixes
    const disabledSet = new Set<string>();

    selectedScopes.forEach((scope) => {
      // Check if the scope is in the form `xxx:*`
      if (scope.endsWith(':*')) {
        // Convert something like `read:*` into the prefix `read:`
        const prefix = scope.replace(':*', ':');

        // Disable all scopes that start with the prefix (but are not the selected scope itself)
        Scopes.forEach((s) => {
          if (s.startsWith(prefix) && s !== scope) {
            disabledSet.add(s);
          }
        });
      }
    });

    setDisabledScopes(disabledSet);
  }, [watch]);

  return (
    <div className="border rounded">
      <AccessTokenScopeList scopeObject={ScopesMap} register={register} disabledScopes={disabledScopes} />
    </div>
  );
};
