import type { CompletionContext } from '@codemirror/autocomplete';
import { syntaxTree } from '@codemirror/language';
import emojiData from 'emoji-mart/data/all.json';


const getEmojiDataArray = (): string[] => {
  const rawEmojiDataArray = emojiData.categories;

  const emojiCategoriesData = [
    'people',
    'nature',
    'foods',
    'activity',
    'places',
    'objects',
    'symbols',
    'flags',
  ];

  const fixedEmojiDataArray: string[] = [];

  emojiCategoriesData.forEach((value) => {
    const tempArray = rawEmojiDataArray.find(obj => obj.id === value)?.emojis;

    if (tempArray == null) {
      return;
    }

    fixedEmojiDataArray.push(...tempArray);
  });

  return fixedEmojiDataArray;
};

const emojiDataArray = getEmojiDataArray();

const emojiOptions = emojiDataArray.map(
  tag => ({ label: `:${tag}`, type: 'keyword' }),
);

export const completeEmojiInput = (context: CompletionContext) => {
  const nodeBefore = syntaxTree(context.state).resolveInner(context.pos, -1);
  const textBefore = context.state.sliceDoc(nodeBefore.from, context.pos);
  const emojiBefore = /:\w*$/.exec(textBefore);

  if (!emojiBefore && !context.explicit) return null;

  return {
    from: emojiBefore ? nodeBefore.from + emojiBefore.index : context.pos,
    options: emojiOptions,
    validFor: /^(:\w)?$/,
  };
};

// const EmojiHintModalStyle = {
//   maxHeight: '40vh',
//   overflowY: 'auto',
//   width: '70vh',
// };

// type EmojiHintProps = {
//   codeMirrorEditor: UseCodeMirrorEditor | undefined,
// }

// export const EmojiHint: FC<EmojiHintProps> = (props) => {
//   const { codeMirrorEditor } = props;

//   const { data: emojiHintModalData } = useEmojiHintModal();

//   const { isOpened } = emojiHintModalData;

//   const suggestedEmojiArray = useEmojiAutoCompletion('f');

//   return (
//     <>
//       {
//         isOpened
//           ? (
//             <div style={EmojiHintModalStyle} className="modal-content">
//               {suggestedEmojiArray.map(emojiName => (
//                 <EmojiHintItem codeMirrorEditor={codeMirrorEditor} emojiName={emojiName} />
//               ))}
//             </div>
//           ) : (
//             ''
//           )
//       }
//     </>
//   );
// };
