import {
  type Atom,
  type PrimitiveAtom,
  type SetStateAction,
} from 'jotai';

export type UseAtom<AtomType> = AtomType extends PrimitiveAtom<infer Value>
  ? readonly [Value, (update: SetStateAction<Value>) => void]
  : AtomType extends Atom<infer Value>
  ? readonly [Value, never]
  : never;

/**
 * 更新関数を実際の値に解決するヘルパー関数
 */
export const resolveSetStateAction = <T>(newValue: SetStateAction<T>, currentValue: T): T => {
  return typeof newValue === 'function'
    ? (newValue as (prev: T) => T)(currentValue)
    : newValue;
};
