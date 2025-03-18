import React from 'react';

import type { UseFormRegisterReturn } from 'react-hook-form';

import type { Scope } from '../../../interfaces/scope';


interface scopeObject {
  [key: string]: Scope | scopeObject;
}

interface AccessTokenScopeListProps {
  scopeObject: scopeObject;
  register: UseFormRegisterReturn<'scopes'>;
  disabledScopes: Set<Scope>
  level?: number;
}

/**
 * Renders the permission object recursively as nested checkboxes.
 */
export const AccessTokenScopeList: React.FC<AccessTokenScopeListProps> = ({
  scopeObject,
  register,
  disabledScopes,
  level = 0,
}) => {


  // Convert object into an array to determine "first vs. non-first" elements
  const entries = Object.entries(scopeObject);

  return (
    <>
      {entries.map(([scopeKey, scopeValue], idx) => {
        // Indent according to the level
        const indentationStyle = { marginLeft: `${(level + 1) * 20}px` };
        // Example: Insert <hr> only for levels 0 or 1, except for the first item
        const showHr = (level === 0 || level === 1) && idx !== 0;

        if (typeof scopeValue === 'object') {
          return (
            <div key={scopeKey}>
              {showHr && <hr className="my-1" />}
              <div className="my-1 row">
                <div className="col-md-5">
                  <label className="form-check-label fw-bold" style={indentationStyle}>{scopeKey}</label>
                </div>
                <div className="col form-text fw-bold">desc for {scopeKey}</div>
              </div>

              {/* Render recursively */}
              <AccessTokenScopeList
                scopeObject={scopeValue as scopeObject}
                register={register}
                level={level + 1}
                disabledScopes={disabledScopes}
              />
            </div>
          );
        }
        // If it's a string, render a checkbox
        return (
          <div key={scopeKey} className="row my-1">
            <div className="col-md-5">
              <input
                className="form-check-input"
                style={indentationStyle}
                type="checkbox"
                id={scopeValue as string}
                disabled={disabledScopes.has(scopeValue)}
                value={scopeValue as string}
                {...register}
              />
              <label className="form-check-label ms-2" htmlFor={scopeValue as string}>
                {scopeKey}
              </label>
            </div>
            <div className="col form-text">desc for {scopeKey}</div>
          </div>
        );
      })}
    </>
  );
};
