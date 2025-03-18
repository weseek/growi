import React from 'react';

import type { UseFormRegisterReturn } from 'react-hook-form';

import { parseScopes } from '~/client/util/scope-util';

import { SCOPE } from '../../../interfaces/scope';

import { AccessTokenScopeList } from './AccessTokenScopeList';

/**
 * Props for AccessTokenScopeSelect
 */
type AccessTokenScopeSelectProps = {
  /** React Hook Form's register function for a field named "scopes" */
  register: UseFormRegisterReturn<'scopes'>;
};

/**
 * Displays a list of permissions in a recursive, nested checkbox interface.
 */
export const AccessTokenScopeSelect: React.FC<AccessTokenScopeSelectProps> = ({ register }) => {
  return (
    <div className="border rounded">
      <AccessTokenScopeList scopeObject={parseScopes(SCOPE)} register={register} />
    </div>
  );
};
