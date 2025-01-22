import { LoadingSpinner } from '@growi/ui/dist/components';

export const CreatingNewPageSpinner = ({ show }: { show?: boolean }): React.ReactElement => {
  if (!show) {
    return <></>;
  }

  return (
    <div className="text-center opacity-50 py-2">
      <LoadingSpinner className="mr-1" />
    </div>
  );
};
