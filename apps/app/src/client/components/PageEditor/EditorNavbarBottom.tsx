import type { JSX } from 'react';

import dynamic from 'next/dynamic';

import { useDrawerOpened } from '~/stores/ui';

import styles from './EditorNavbarBottom.module.scss';

const moduleClass = styles['grw-editor-navbar-bottom'];

const SavePageControls = dynamic(() => import('~/client/components/SavePageControls').then((mod) => mod.SavePageControls), { ssr: false });
const OptionsSelector = dynamic(() => import('~/client/components/PageEditor/OptionsSelector').then((mod) => mod.OptionsSelector), { ssr: false });

const EditorNavbarBottom = (): JSX.Element => {
  const { mutate: mutateDrawerOpened } = useDrawerOpened();

  return (
    <div className="border-top" data-testid="grw-editor-navbar-bottom">
      <div className={`flex-expand-horiz align-items-center p-2 ps-md-3 pe-md-4 ${moduleClass}`}>
        <a role="button" className="nav-link btn-lg p-2 d-md-none me-3 opacity-50" onClick={() => mutateDrawerOpened(true)}>
          <span className="material-symbols-outlined fs-2">reorder</span>
        </a>
        <form className="me-auto">
          <OptionsSelector />
        </form>
        <form>
          <SavePageControls />
        </form>
      </div>
    </div>
  );
};

export default EditorNavbarBottom;
