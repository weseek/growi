import dynamic from 'next/dynamic';

import styles from './EditorNavbarBottom.module.scss';

const moduleClass = styles['grw-editor-navbar-bottom'];

const SavePageControls = dynamic(() => import('~/components/SavePageControls').then(mod => mod.SavePageControls), { ssr: false });
const OptionsSelector = dynamic(() => import('~/components/PageEditor/OptionsSelector').then(mod => mod.OptionsSelector), { ssr: false });

const EditorNavbarBottom = (): JSX.Element => {
  return (
    <div className="border-top" data-testid="grw-editor-navbar-bottom">
      <div className={`flex-expand-horiz align-items-center px-2 py-1 py-md-2 px-md-3 ${moduleClass}`}>
        <form className="m-2 me-auto">
          <OptionsSelector />
        </form>
        <form className="m-2">
          <SavePageControls />
        </form>
      </div>
    </div>
  );
};

export default EditorNavbarBottom;
