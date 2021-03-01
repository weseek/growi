import React, { FC } from 'react';

import { usePreviewRenderer } from '~/stores/renderer';

import RevisionRenderer from '../Page/RevisionRenderer';


type Props = {
  markdown?: string,
  inputRef?: (instance: HTMLDivElement | null) => void,
  onScroll?: (offset: number) => void,
}

const Preview: FC<Props> = ({ markdown, inputRef, onScroll }: Props) => {

  const { data: renderer } = usePreviewRenderer();

  if (renderer == null) {
    return <></>;
  }

  return (
    // eslint-disable-next-line arrow-body-style
    <div
      className="page-editor-preview-body"
      ref={(elm) => {
        if (inputRef != null) {
          inputRef(elm);
        }
      }}
      onScroll={(event) => {
        if (onScroll != null) {
          onScroll(event.currentTarget.scrollTop);
        }
      }}
    >
      { markdown != null && (
        <RevisionRenderer
          renderer={renderer}
          markdown={markdown}
        />
      )}
    </div>
  );
};

// class DeprecatedPreview extends React.PureComponent {

//   constructor(props) {
//     super(props);

//     this.state = {
//       html: '',
//     };
//   }

//   componentDidMount() {
//     this.initCurrentRenderingContext();
//     this.renderPreview();
//   }

//   componentDidUpdate(prevProps) {
//     const { markdown: prevMarkdown } = prevProps;
//     const { markdown } = this.props;

//     // render only when props.markdown is updated
//     if (markdown !== prevMarkdown) {
//       this.initCurrentRenderingContext();
//       this.renderPreview();
//       return;
//     }

//     const { interceptorManager } = this.props.appContainer;

//     interceptorManager.process('postRenderPreviewHtml', this.currentRenderingContext);
//   }

//   initCurrentRenderingContext() {
//     this.currentRenderingContext = {
//       markdown: this.props.markdown,
//       currentPagePath: decodeURIComponent(window.location.pathname),
//     };
//   }

//   async renderPreview() {
//     const { appContainer } = this.props;
//     const { growiRenderer } = this;

//     const { interceptorManager } = appContainer;
//     const context = this.currentRenderingContext;

//     await interceptorManager.process('preRenderPreview', context);
//     await interceptorManager.process('prePreProcess', context);
//     context.markdown = growiRenderer.preProcess(context.markdown);
//     await interceptorManager.process('postPreProcess', context);
//     context.parsedHTML = growiRenderer.process(context.markdown);
//     await interceptorManager.process('prePostProcess', context);
//     context.parsedHTML = growiRenderer.postProcess(context.parsedHTML);
//     await interceptorManager.process('postPostProcess', context);
//     await interceptorManager.process('preRenderPreviewHtml', context);

//     this.setState({ html: context.parsedHTML });
//   }

//   render() {
//     return (
//       <Subscribe to={[EditorContainer]}>
//         { editorContainer => (
//           // eslint-disable-next-line arrow-body-style
//           <div
//             className="page-editor-preview-body"
//             ref={(elm) => {
//                 this.previewElement = elm;
//                 if (this.props.inputRef != null) {
//                   this.props.inputRef(elm);
//                 }
//               }}
//             onScroll={(event) => {
//                 if (this.props.onScroll != null) {
//                   this.props.onScroll(event.target.scrollTop);
//                 }
//               }}
//           >
//             <RevisionBody
//               {...this.props}
//               html={this.state.html}
//               renderMathJaxInRealtime={editorContainer.state.previewOptions.renderMathJaxInRealtime}
//             />
//           </div>
//         )}
//       </Subscribe>
//     );
//   }

// }

// DeperecatedPreview.propTypes = {
//   markdown: PropTypes.string,
//   inputRef: PropTypes.func,
//   isMathJaxEnabled: PropTypes.bool,
//   renderMathJaxOnInit: PropTypes.bool,
//   onScroll: PropTypes.func,
// };

export default Preview;
