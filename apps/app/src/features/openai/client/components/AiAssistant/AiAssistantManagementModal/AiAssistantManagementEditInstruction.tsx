import { ModalBody, Input } from 'reactstrap';

import { AiAssistantManagementHeader } from './AiAssistantManagementHeader';

type Props = {
  instruction: string;
  onChange: (value: string) => void;
  onReset: () => void;
}

export const AiAssistantManagementEditInstruction = (props: Props): JSX.Element => {
  const { instruction, onChange, onReset } = props;

  return (
    <>
      <AiAssistantManagementHeader />

      <ModalBody className="px-4">
        <p className="text-secondary py-1">
          アシスタントの振る舞いを決める指示文を設定できます。<br />
          この指示に従ってにアシスタントの回答や分析を行います。
        </p>

        <Input
          autoFocus
          type="textarea"
          className="mb-3"
          rows="8"
          value={instruction}
          onChange={e => onChange(e.target.value)}
        />

        <button type="button" onClick={onReset} className="btn btn-outline-secondary btn-sm">
          デフォルトに戻す
        </button>
      </ModalBody>
    </>
  );
};
