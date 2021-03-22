import { useRouter } from 'next/router';
import { VFC } from 'react';
import { RenamedAlert } from '~/components/PageAlert/RenamedAlert';

export const PageAlerts:VFC = () => {
  const router = useRouter();
  const { renamedFrom } = router.query;

  return (
    <div className="row row-alerts d-edit-none">
      <div className="col-sm-12">
        {renamedFrom != null && <RenamedAlert renamedFrom={renamedFrom as string} />}
      </div>
    </div>
  );
};
