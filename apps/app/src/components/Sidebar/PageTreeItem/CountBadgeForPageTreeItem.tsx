import CountBadge from '~/components/Common/CountBadge';
import type { TreeItemToolProps } from '~/components/TreeItem';
import { usePageTreeDescCountMap } from '~/stores/ui';

export const CountBadgeForPageTreeItem = (props: TreeItemToolProps): JSX.Element => {
  const { getDescCount } = usePageTreeDescCountMap();

  const { page } = props.itemNode;

  const descendantCount = getDescCount(page._id) || page.descendantCount || 0;

  return (
    <>
      {descendantCount > 0 && (
        <CountBadge count={descendantCount} />
      )}
    </>
  );
};
