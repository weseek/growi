import React from 'react';

import type { UseFormRegisterReturn } from 'react-hook-form';
import { v4 as uuid } from 'uuid';

import { SCOPE } from '../../../interfaces/scope';

/** Top-level READ/WRITE structure for scope definitions */
interface ScopePermissions {
  READ?: PermissionBranch;
  WRITE?: PermissionBranch;
  [key: string]: unknown;
}

/** Nested permission object, e.g. { ADMIN: { ALL: "read:admin:*", TOP: { ... } } } */
interface PermissionBranch {
  [key: string]: PermissionBranch | string;
}

/** The merged node includes optional read/write strings plus any nested keys */
interface MergedNode {
  read?: string;
  write?: string;
  [key: string]: MergedNode | string | undefined;
}

/**
 * After we transform the merged tree, we end up with a structure
 * whose keys can be "read:xyz", "write:xyz", or uppercase subkeys
 * that point to further nesting.
 */
interface TransformedNode {
  [key: string]: string | TransformedNode;
}

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
      <RecursiveScopeList scopeObject={parsePermissions(SCOPE)} register={register} />
    </div>
  );
};


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


interface RecursiveScopeListProps {
  /** A node in the final transformed permission structure */
  scopeObject: TransformedNode;
  /** React Hook Form's register function for a field named "scopes" */
  register: UseFormRegisterReturn<'scopes'>;
  /** Depth level used for indentation (default 0) */
  level?: number;
}

/**
 * Renders the permission object recursively as nested checkboxes.
 */
const RecursiveScopeList: React.FC<RecursiveScopeListProps> = ({
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
                <div className="col fs-6 text-secondary">desc for {scopeKey}</div>
              </div>

              {/* Recurse into the nested object */}
              <RecursiveScopeList
                scopeObject={scopeValue as TransformedNode}
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
                {scopeValue as string}
              </label>
            </div>
            <div className="col fs-6 text-secondary">desc for {scopeValue as string}</div>
          </div>
        );
      })}
    </>
  );
};

/**
 * Build an intermediate tree structure merging READ/WRITE branches.
 * "ALL" keys in nested levels merge into the parent node’s read/write.
 */
function buildMergedTree(permissions: ScopePermissions): MergedNode {
  const root: MergedNode = {};

  // Recursively traverse each subtree under a READ or WRITE key
  function traverse(
      obj: PermissionBranch,
      action: 'read' | 'write',
      path: string[],
  ) {
    for (const [key, value] of Object.entries(obj)) {
      const lowerKey = key.toLowerCase();

      // Leaf node is a string like "read:admin:*"
      if (typeof value === 'string') {
        // If the key is "ALL" and we're not at the top level, merge directly into the parent
        if (lowerKey === 'all' && path.length > 0) {
          const parentNode = getOrCreateNode(root, path);
          parentNode[action] = value;
        }
        else {
          // Otherwise, create/obtain the subnode and set read/write
          const node = getOrCreateNode(root, [...path, lowerKey]);
          node[action] = value;
        }
      }

      // If it’s another object, recurse deeper
      else if (value && typeof value === 'object') {
        if (lowerKey === 'all' && path.length > 0) {
          // If deeper levels under "ALL", merge them into the same path
          traverse(value as PermissionBranch, action, path);
        }
        else {
          traverse(value as PermissionBranch, action, [...path, lowerKey]);
        }
      }
    }
  }

  // Helper to walk the path array and create/fetch a node in the root
  function getOrCreateNode(base: MergedNode, segments: string[]): MergedNode {
    let curr = base;
    for (const seg of segments) {
      if (!curr[seg]) {
        curr[seg] = {};
      }
      curr = curr[seg] as MergedNode;
    }
    return curr;
  }

  // Process top-level READ/WRITE objects
  for (const [actionKey, subtree] of Object.entries(permissions)) {
    const action = actionKey.toLowerCase() === 'read' ? 'read' : 'write';
    if (subtree && typeof subtree === 'object') {
      traverse(subtree as PermissionBranch, action, []);
    }
  }

  return root;
}

/**
 * Convert the merged tree to final structure:
 * - Insert "read:xyz" / "write:xyz" as keys for each node
 * - Uppercase sub-node keys for further nesting
 */
function transformTree(node: MergedNode, path: string): TransformedNode {
  const result: TransformedNode = {};

  // If the node has read/write, assign them as new keys
  if (node.read) {
    result[`read:${path}`] = node.read;
  }
  if (node.write) {
    result[`write:${path}`] = node.write;
  }

  // For each nested key, transform recursively
  for (const [k, v] of Object.entries(node)) {
    if (k === 'read' || k === 'write') continue;

    const subPath = path ? `${path}:${k}` : k;
    const upperKey = path ? `${path}:${k}`.toUpperCase() : k.toUpperCase();

    if (typeof v === 'object' && v !== null) {
      result[upperKey] = transformTree(v as MergedNode, subPath);
    }
  }
  return result;
}

/**
 * Main function that:
 * 1) Merges the SCOPE’s READ/WRITE objects into one intermediate tree.
 * 2) Transforms that intermediate tree into an object of type { [key: string]: string | object }.
 */
function parsePermissions(permissions: ScopePermissions): Record<string, TransformedNode> {
  const merged = buildMergedTree(permissions);
  const result: Record<string, TransformedNode> = {};

  // Transform each top-level key of the merged tree
  for (const [topKey, node] of Object.entries(merged)) {
    const upperKey = topKey.toUpperCase();
    if (typeof node === 'object' && node !== null) {
      result[upperKey] = transformTree(node as MergedNode, topKey);
    }
  }

  return result;
}
