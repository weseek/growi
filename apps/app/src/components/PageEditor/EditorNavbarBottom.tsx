import dynamic from 'next/dynamic';

import styles from './EditorNavbarBottom.module.scss';

const moduleClass = styles['grw-editor-navbar-bottom'];

const SavePageControls = dynamic(() => import('~/components/SavePageControls').then(mod => mod.SavePageControls), { ssr: false });
const OptionsSelector = dynamic(() => import('~/components/PageEditor/OptionsSelector').then(mod => mod.OptionsSelector), { ssr: false });

const EditorNavbarBottom = (): JSX.Element => {
  return (
    <div className="border-top" data-testid="grw-editor-navbar-bottom">
      <div className={`flex-expand-horiz align-items-center p-2 ps-md-3 pe-md-4 ${moduleClass}`}>
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
