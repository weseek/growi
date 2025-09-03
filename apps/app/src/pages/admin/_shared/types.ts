import type { ReactNode } from 'react';

import type { Container } from 'unstated';

export type AnyUnstatedContainer = Container<Record<string, unknown>>;

export interface AdminPageFrameProps {
  /** Page <title> value (after generateCustomTitle) */
  title: string;
  /** Visible heading shown in AdminLayout header */
  componentTitle?: string;
  /** Access control flag */
  isAccessDeniedForNonAdminUser: boolean;
  /** Optional injected unstated containers */
  containers?: AnyUnstatedContainer[];
  children?: ReactNode;
}
