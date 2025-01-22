import { Skeleton } from '~/client/components/Skeleton';

import styles from './ItemsTreeContentSkeleton.module.scss';

const ItemsTreeContentSkeleton = (): React.ReactElement => {

  return (
    <ul className="list-group py-3">
      <Skeleton additionalClass={`${styles['text-skeleton-level1']} pe-3`} />
      <Skeleton additionalClass={`${styles['text-skeleton-level2']} pe-3`} />
      <Skeleton additionalClass={`${styles['text-skeleton-level2']} pe-3`} />
    </ul>
  );
};

export default ItemsTreeContentSkeleton;
