/*
 * Common types and interfaces
 */

import { ReactNode } from 'react';

export type HasChildren<T = ReactNode> = {
  children?: T
}
