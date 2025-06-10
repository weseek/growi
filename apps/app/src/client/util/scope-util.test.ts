import { ALL_SIGN } from '@growi/core/dist/interfaces';
import { describe, it, expect } from 'vitest';

import { parseScopes, getDisabledScopes, extractScopes } from './scope-util';

describe('scope-util', () => {

  const mockScopes = {
    READ: {
      USER: 'read:user',
      ADMIN: {
        SETTING: 'read:admin:setting',
        ALL: 'read:admin:all',
      },
      ALL: 'read:all',
    },
    WRITE: {
      USER: 'write:user',
      ADMIN: {
        SETTING: 'write:admin:setting',
        ALL: 'write:admin:all',
      },
      ALL: 'write:all',
    },
  };

  it('should parse scopes correctly for non-admin', () => {
    const result = parseScopes({ scopes: mockScopes, isAdmin: false });

    // Check that admin scopes are excluded
    expect(result.ADMIN).toBeUndefined();
    expect(result.ALL).toBeUndefined();

    // Check that user scopes are included
    expect(result.USER).toBeDefined();
    expect(result.USER['read:user']).toBe('read:user');
    expect(result.USER['write:user']).toBe('write:user');
  });

  it('should include admin scopes for admin users', () => {
    const result = parseScopes({ scopes: mockScopes, isAdmin: true });

    // Check that admin scopes are included
    expect(result.ADMIN).toBeDefined();
    expect(result.ALL).toBeDefined();

    // Check admin settings
    expect(result.ADMIN['admin:setting']['read:admin:setting']).toBe('read:admin:setting');
    expect(result.ADMIN['admin:setting']['write:admin:setting']).toBe('write:admin:setting');

    // Check ALL category
    expect(result.ALL['read:all']).toBe('read:all');
    expect(result.ALL['write:all']).toBe('write:all');
  });

  it('should return empty set when no scopes are selected', () => {
    const result = getDisabledScopes([], ['read:user', 'write:user']);
    expect(result.size).toBe(0);
  });

  it('should disable specific scopes when a wildcard is selected', () => {
    const selectedScopes = [`read:${ALL_SIGN}`];
    const availableScopes = ['read:user', 'read:admin', 'write:user', `read:${ALL_SIGN}`];

    const result = getDisabledScopes(selectedScopes, availableScopes);

    // Should disable all read: scopes except the wildcard itself
    expect(result.has('read:user')).toBe(true);
    expect(result.has('read:admin')).toBe(true);
    expect(result.has(`read:${ALL_SIGN}`)).toBe(false);
    expect(result.has('write:user')).toBe(false);
  });

  it('should handle multiple wildcard selections', () => {
    const selectedScopes = [`read:${ALL_SIGN}`, `write:${ALL_SIGN}`];
    const availableScopes = [
      'read:user', 'read:admin', `read:${ALL_SIGN}`,
      'write:user', 'write:admin', `write:${ALL_SIGN}`,
    ];

    const result = getDisabledScopes(selectedScopes, availableScopes);

    // Should disable all specific scopes under both wildcards
    expect(result.has('read:user')).toBe(true);
    expect(result.has('read:admin')).toBe(true);
    expect(result.has('write:user')).toBe(true);
    expect(result.has('write:admin')).toBe(true);
    expect(result.has(`read:${ALL_SIGN}`)).toBe(false);
    expect(result.has(`write:${ALL_SIGN}`)).toBe(false);
  });

  it('should extract all scope strings from a nested object', () => {
    const scopeObj = {
      USER: {
        'read:user': 'read:user',
        'write:user': 'write:user',
      },
      ADMIN: {
        'ADMIN:SETTING': {
          'read:admin:setting': 'read:admin:setting',
          'write:admin:setting': 'write:admin:setting',
        },
      },
    };

    const result = extractScopes(scopeObj);

    expect(result).toContain('read:user');
    expect(result).toContain('write:user');
    expect(result).toContain('read:admin:setting');
    expect(result).toContain('write:admin:setting');
    expect(result.length).toBe(4);
  });

  it('should return empty array for empty object', () => {
    const result = extractScopes({});
    expect(result).toEqual([]);
  });

  it('should handle objects with no string values', () => {
    const scopeObj = {
      level1: {
        level2: {
          level3: {},
        },
      },
    };

    const result = extractScopes(scopeObj);
    expect(result).toEqual([]);
  });
});
