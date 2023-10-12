import { v4 as uuid } from 'uuid';

export function useIdCounter() {
  return {
    generateId: () => uuid(),
  };
}
