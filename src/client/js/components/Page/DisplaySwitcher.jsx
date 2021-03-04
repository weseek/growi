import dynamic from 'next/dynamic';
import React from 'react';
import { TabContent, TabPane } from 'reactstrap';

import { useEditorMode } from '~/stores/ui';

import Page from '../Page';
// import UserInfo from '../User/UserInfo';
// import ContentLinkButtons from '../ContentLinkButtons';
import { PageAccessories } from '~/components/PageAccessory/PageAccessories';


const DisplaySwitcher = (props) => {
  const { data: editorMode } = useEditorMode();
  // const { pageUser } = pageContainer.state;

  // dynamic import to skip rendering at SSR
  const TableOfContents = dynamic(() => import('../TableOfContents'), { ssr: false });
  const PageEditor = dynamic(() => import('../PageEditor'), { ssr: false });
  // const PageEditorByHackmd = dynamic(() => import('../PageEditorByHackmd'), { ssr: false });
  // const EditorNavbarBottom = dynamic(() => import('../PageEditor/EditorNavbarBottom'), { ssr: false });

  return (
    <>
      <TabContent activeTab={editorMode}>
        <TabPane tabId="view">
          <div className="d-flex flex-column flex-lg-row-reverse">

            <div className="grw-side-contents-container">
              <div className="grw-side-contents-sticky-container">
                <div className="border-bottom pb-1">
                  <PageAccessories />
                </div>

                <div className="d-none d-lg-block">
                  <div id="revision-toc" className="revision-toc">
                    <TableOfContents />
                  </div>
                  {/* <ContentLinkButtons /> */}
                </div>
              </div>
            </div>

            <div className="flex-grow-1 flex-basis-0 mw-0">
              {/* {pageUser && <UserInfo pageUser={pageUser} />} */}
              <Page />
            </div>

          </div>
        </TabPane>
        <TabPane tabId="editor">
          <div id="page-editor">
            <PageEditor />
          </div>
        </TabPane>
        <TabPane tabId="hackmd">
          <div id="page-editor-with-hackmd">
            {/* <PageEditorByHackmd /> */}
          </div>
        </TabPane>
      </TabContent>
      {/* {editorMode !== 'view' && <EditorNavbarBottom /> } */}
    </>
  );
};

export default DisplaySwitcher;
