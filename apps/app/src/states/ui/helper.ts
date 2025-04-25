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
