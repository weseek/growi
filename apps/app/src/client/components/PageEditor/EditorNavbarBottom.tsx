import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';

import { useDrawerOpened } from '~/stores/ui';

import styles from './EditorNavbarBottom.module.scss';

const moduleClass = styles['grw-editor-navbar-bottom'];

const SavePageControls = dynamic(() => import('~/client/components/SavePageControls').then(mod => mod.SavePageControls), { ssr: false });
const OptionsSelector = dynamic(() => import('~/client/components/PageEditor/OptionsSelector').then(mod => mod.OptionsSelector), { ssr: false });

const EditorNavbarBottom = (): JSX.Element => {

  const { t } = useTranslation();
  const { mutate: mutateDrawerOpened } = useDrawerOpened();

  return (
    <div className="border-top" data-testid="grw-editor-navbar-bottom">
      <div className={`flex-expand-horiz align-items-center p-2 ps-md-3 pe-md-4 ${moduleClass}`}>
        <a
          role="button"
          className="nav-link btn-lg p-2 d-md-none me-3 opacity-50"
          onClick={() => mutateDrawerOpened(true)}
        >
          <span className="material-symbols-outlined fs-2">reorder</span>
        </a>
        <form className="me-auto d-flex gap-2">
          <OptionsSelector />
          <button
            type="button"
            className="btn btn-sm btn-outline-neutral-secondary py-0"
          >
            <span className="d-flex align-items-center">
              <span className="growi-custom-icons py-0 fs-6">ai_assistant</span>
              <span className="ms-1 me-1">{t('page_edit.editor_assistant')}</span>
            </span>
          </button>
        </form>
        <form>
          <SavePageControls />
        </form>
      </div>
    </div>
  );
};

export default EditorNavbarBottom;
