
import React from 'react';

import type { UseFormRegisterReturn } from 'react-hook-form';
import { v4 as uuid } from 'uuid';

/**
 * After we transform the merged tree, we end up with a structure
 * whose keys can be "read:xyz", "write:xyz", or uppercase subkeys
 * that point to further nesting.
 */
interface scopeObject {
  [key: string]: string | scopeObject;
}


interface AccessTokenScopeListProps {
  /** A node in the final transformed permission structure */
  scopeObject: scopeObject;
  /** React Hook Form's register function for a field named "scopes" */
  register: UseFormRegisterReturn<'scopes'>;
  /** Depth level used for indentation (default 0) */
  level?: number;
}


function generateKeys(count: number): string[] {
  return Array.from({ length: count }, () => uuid());
}

const IndentationSpans: React.FC<{ count: number }> = ({ count }) => {
  const [spanKeys, setSpanKeys] = React.useState<string[]>(() => generateKeys(count));

  React.useEffect(() => {
    setSpanKeys(generateKeys(count));
  }, [count]);

  return (
    <>
      {spanKeys.map(k => (
        <span key={k} className="ms-3" />
      ))}
    </>
  );
};


/**
 * Renders the permission object recursively as nested checkboxes.
 */
export const AccessTokenScopeList: React.FC<AccessTokenScopeListProps> = ({
  scopeObject,
  register,
  level = 0,
}) => {
  // Convert object into an array so we can detect "first vs. not-first"
  const entries = Object.entries(scopeObject);

  return (
    <>
      {entries.map(([scopeKey, scopeValue], idx) => {
        const isNestedObject = typeof scopeValue === 'object' && !Array.isArray(scopeValue);

        const showHr = (level === 0 || level === 1) && idx !== 0;

        if (isNestedObject) {
          // If the child is an object, display label, optional <hr>, and recurse
          return (
            <div key={scopeKey}>
              {showHr && <hr className="my-1" />}

              <div className="my-1 row">
                <div className="col-md-5">
                  <IndentationSpans count={level + 1} />
                  <label className="form-check-label fw-bold">{scopeKey}</label>
                </div>
                <div className="col form-text">desc for {scopeKey}</div>
              </div>

              {/* Recurse into the nested object */}
              <AccessTokenScopeList
                scopeObject={scopeValue as scopeObject}
                register={register}
                level={level + 1}
              />
            </div>
          );
        }

        // If the child is a string, it's a leaf checkbox
        return (
          <div key={scopeKey} className="row my-1">
            <div className="col-md-5">
              <IndentationSpans count={level + 1} />
              <input
                className="form-check-input"
                type="checkbox"
                id={scopeValue as string}
                value={scopeValue as string}
                {...register}
              />
              <label className="form-check-label ms-2" htmlFor={scopeValue as string}>
                {scopeKey as string}
              </label>
            </div>
            <div className="col form-text">desc for {scopeKey as string}</div>
          </div>
        );
      })}
    </>
  );
};
