import React, { useMemo } from 'react';
import loggerFactory from '~/utils/logger';

// import PageContainer from '../services/PageContainer';
// import EditorContainer from '../services/EditorContainer';

// import LinkEditModal from './PageEditor/LinkEditModal';
import RevisionRenderer from './Page/RevisionRenderer';
import { useCurrentUser } from '~/stores/context';
import { useCurrentPageSWR } from '~/stores/page';
import MarkdownRenderer from '~/service/renderer/markdown-renderer';
import { useViewRenderer } from '~/stores/renderer';
import { useIsMobile } from '~/stores/ui';
// import GridEditModal from './PageEditor/GridEditModal';
// import HandsontableModal from './PageEditor/HandsontableModal';
// import DrawioModal from './PageEditor/DrawioModal';
// import mtu from './PageEditor/MarkdownTableUtil';
// import mdu from './PageEditor/MarkdownDrawioUtil';

const logger = loggerFactory('growi:Page');

// class Page extends React.Component {

//   constructor(props) {
//     super(props);

//     this.state = {
//       currentTargetTableArea: null,
//       currentTargetDrawioArea: null,
//     };

//     this.growiRenderer = this.props.appContainer.getRenderer('page');

//     this.gridEditModal = React.createRef();
//     this.linkEditModal = React.createRef();
//     this.handsontableModal = React.createRef();
//     this.drawioModal = React.createRef();

//     this.saveHandlerForHandsontableModal = this.saveHandlerForHandsontableModal.bind(this);
//     this.saveHandlerForDrawioModal = this.saveHandlerForDrawioModal.bind(this);
//   }

//   componentWillMount() {
//     this.props.appContainer.registerComponentInstance('Page', this);
//   }

//   /**
//    * launch HandsontableModal with data specified by arguments
//    * @param beginLineNumber
//    * @param endLineNumber
//    */
//   launchHandsontableModal(beginLineNumber, endLineNumber) {
//     const markdown = this.props.pageContainer.state.markdown;
//     const tableLines = markdown.split(/\r\n|\r|\n/).slice(beginLineNumber - 1, endLineNumber).join('\n');
//     this.setState({ currentTargetTableArea: { beginLineNumber, endLineNumber } });
//     this.handsontableModal.current.show(MarkdownTable.fromMarkdownString(tableLines));
//   }

//   /**
//    * launch DrawioModal with data specified by arguments
//    * @param beginLineNumber
//    * @param endLineNumber
//    */
//   launchDrawioModal(beginLineNumber, endLineNumber) {
//     const markdown = this.props.pageContainer.state.markdown;
//     const drawioMarkdownArray = markdown.split(/\r\n|\r|\n/).slice(beginLineNumber - 1, endLineNumber);
//     const drawioData = drawioMarkdownArray.slice(1, drawioMarkdownArray.length - 1).join('\n').trim();
//     this.setState({ currentTargetDrawioArea: { beginLineNumber, endLineNumber } });
//     this.drawioModal.current.show(drawioData);
//   }

//   async saveHandlerForHandsontableModal(markdownTable) {
//     const { pageContainer, editorContainer } = this.props;
//     const optionsToSave = editorContainer.getCurrentOptionsToSave();

//     const newMarkdown = mtu.replaceMarkdownTableInMarkdown(
//       markdownTable,
//       this.props.pageContainer.state.markdown,
//       this.state.currentTargetTableArea.beginLineNumber,
//       this.state.currentTargetTableArea.endLineNumber,
//     );

//     try {
//       // disable unsaved warning
//       editorContainer.disableUnsavedWarning();

//       // eslint-disable-next-line no-unused-vars
//       const { page, tags } = await pageContainer.save(newMarkdown, optionsToSave);
//       logger.debug('success to save');

//       pageContainer.showSuccessToastr();
//     }
//     catch (error) {
//       logger.error('failed to save', error);
//       pageContainer.showErrorToastr(error);
//     }
//     finally {
//       this.setState({ currentTargetTableArea: null });
//     }
//   }

//   async saveHandlerForDrawioModal(drawioData) {
//     const { pageContainer, editorContainer } = this.props;
//     const optionsToSave = editorContainer.getCurrentOptionsToSave();

//     const newMarkdown = mdu.replaceDrawioInMarkdown(
//       drawioData,
//       this.props.pageContainer.state.markdown,
//       this.state.currentTargetDrawioArea.beginLineNumber,
//       this.state.currentTargetDrawioArea.endLineNumber,
//     );

//     try {
//       // disable unsaved warning
//       editorContainer.disableUnsavedWarning();

//       // eslint-disable-next-line no-unused-vars
//       const { page, tags } = await pageContainer.save(newMarkdown, optionsToSave);
//       logger.debug('success to save');

//       pageContainer.showSuccessToastr();
//     }
//     catch (error) {
//       logger.error('failed to save', error);
//       pageContainer.showErrorToastr(error);
//     }
//     finally {
//       this.setState({ currentTargetDrawioArea: null });
//     }
//   }

//   render() {
//     const { appContainer, pageContainer } = this.props;
//     const { isMobile } = appContainer;
//     const isLoggedIn = appContainer.currentUser != null;
//     const { markdown } = pageContainer.state;

//     return (
//       <div className={`mb-5 ${isMobile ? 'page-mobile' : ''}`}>
//         <RevisionRenderer growiRenderer={this.growiRenderer} markdown={markdown} />

//         { isLoggedIn && (
//           <>
//             <GridEditModal ref={this.gridEditModal} />
//             <LinkEditModal ref={this.LinkEditModal} />
//             <HandsontableModal ref={this.handsontableModal} onSave={this.saveHandlerForHandsontableModal} />
//             <DrawioModal ref={this.drawioModal} onSave={this.saveHandlerForDrawioModal} />
//           </>
//         )}
//       </div>
//     );
//   }

// }

const Page = (props) => {

  const { data: currentPage } = useCurrentPageSWR();
  const { data: isMobile } = useIsMobile();
  const { data: viewRenderer } = useViewRenderer();

  if (currentPage == null) {
    return null;
  }

  return (
    <div className={`${isMobile && 'page-mobile'}`}>
      <RevisionRenderer renderer={viewRenderer} markdown={currentPage.revision.body} />
    </div>
  );
};

export default Page;
