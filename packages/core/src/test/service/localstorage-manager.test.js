// eslint-disable-next-line import/no-unresolved
import 'jest-localstorage-mock';

import { LocalStorageManager } from '~/service/localstorage-manager';

let localStorageManager = null;

beforeEach(() => {
  localStorageManager = LocalStorageManager.getInstance();

  // == init jest-localstorage-mock
  // reset the storage
  localStorage.clear();
  sessionStorage.clear();
  // set preset data
  sessionStorage.setItem('localstorage-manager-test', JSON.stringify({ foo: 'bar' }));
  // reset mocks
  localStorage.setItem.mockClear();
  sessionStorage.setItem.mockClear();
});

describe('LocalStorageManager', () => {
  test('.getInstance() returns the same instance', () => {
    expect(LocalStorageManager.getInstance()).toBe(localStorageManager);
  });

  test('.retrieveFromSessionStorage() with unknown namespace returns the empty object', () => {
    const item = localStorageManager.retrieveFromSessionStorage('unknown namespace');
    expect(item).toEqual({});
  });

  test('.retrieveFromSessionStorage() without key returns the preset data', () => {
    const item = localStorageManager.retrieveFromSessionStorage('localstorage-manager-test');
    expect(item).toEqual({ foo: 'bar' });
  });

  test('.retrieveFromSessionStorage() with key returns the preset data', () => {
    const item = localStorageManager.retrieveFromSessionStorage('localstorage-manager-test', 'foo');
    expect(item).toBe('bar');
  });

  test('.saveToSessionStorage() without key works fine', () => {
    localStorageManager.saveToSessionStorage(
      'localstorage-manager-test',
      { foo: { qux: 'quux' } },
    );

    expect(sessionStorage.__STORE__.length).toBe(1);
    expect(sessionStorage.setItem)
      .toHaveBeenLastCalledWith(
        'localstorage-manager-test',
        JSON.stringify({ foo: { qux: 'quux' } }),
      );
  });

  test('.saveToSessionStorage() with key works fine', () => {
    localStorageManager.saveToSessionStorage(
      'localstorage-manager-test',
      'baz',
      { qux: 'quux' },
    );

    expect(sessionStorage.__STORE__.length).toBe(1);
    expect(sessionStorage.setItem)
      .toHaveBeenLastCalledWith(
        'localstorage-manager-test',
        JSON.stringify({ foo: 'bar', baz: { qux: 'quux' } }),
      );
  });

  test('.saveToSessionStorage() with unknown key works fine', () => {
    localStorageManager.saveToSessionStorage(
      'localstorage-manager-test-unknown-key',
      'baz',
      { qux: 'quux' },
    );

    expect(sessionStorage.__STORE__.length).toBe(2);
    expect(sessionStorage.setItem)
      .toHaveBeenLastCalledWith(
        'localstorage-manager-test-unknown-key',
        JSON.stringify({ baz: { qux: 'quux' } }),
      );
  });

});
