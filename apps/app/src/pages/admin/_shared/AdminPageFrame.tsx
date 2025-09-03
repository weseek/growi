import type { ReactNode, JSX } from 'react';
import React from 'react';

import dynamic from 'next/dynamic';
import Head from 'next/head';
import type { Container } from 'unstated';
import { Provider } from 'unstated';

// Dynamic imports to avoid SSR issues with admin-only components
const AdminLayout = dynamic(() => import('~/components/Layout/AdminLayout'), { ssr: false });
const ForbiddenPage = dynamic(() => import('~/client/components/Admin/ForbiddenPage').then(mod => mod.ForbiddenPage), { ssr: false });

export type AnyContainer = Container<Record<string, unknown>>;

export interface AdminPageFrameProps {
  /** Page <title> value (after generateCustomTitle) */
  title: string;
  /** Visible heading shown in AdminLayout header */
  componentTitle?: string;
  /** Access control flag */
  isAccessDeniedForNonAdminUser: boolean;
  /** Optional injected unstated containers */
  containers?: AnyContainer[];
  children?: ReactNode;
}

/**
 * Admin page frame that centralizes:
 *  - Forbidden guard
 *  - AdminLayout wrapping
 *  - <Head><title /></Head>
 *  - Unstated Provider injection
 */
export const AdminPageFrame = ({
  title,
  componentTitle,
  isAccessDeniedForNonAdminUser,
  containers,
  children,
}: AdminPageFrameProps): JSX.Element => {
  if (isAccessDeniedForNonAdminUser) {
    return <ForbiddenPage />;
  }

  return (
    <Provider inject={containers ?? []}>
      <AdminLayout componentTitle={componentTitle ?? title}>
        <Head>
          <title>{title}</title>
        </Head>
        {children}
      </AdminLayout>
    </Provider>
  );
};

export default AdminPageFrame;
