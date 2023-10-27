import { FC, memo } from 'react';

import dynamic from 'next/dynamic';
import Link from 'next/link';

import { useGrowiCloudUri, useIsAdmin } from '~/stores/context';

import { SkeletonItem } from './SkeletonItem';

import styles from './SecondaryItems.module.scss';


const PersonalDropdown = dynamic(() => import('./PersonalDropdown').then(mod => mod.PersonalDropdown), {
  ssr: false,
  loading: () => <SkeletonItem />,
});


type SecondaryItemProps = {
  label: string,
  href: string,
  iconName: string,
  isBlank?: boolean,
}

const SecondaryItem: FC<SecondaryItemProps> = (props: SecondaryItemProps) => {
  const { iconName, href, isBlank } = props;

  return (
    <Link
      href={href}
      className="d-block btn btn-primary"
      target={`${isBlank ? '_blank' : ''}`}
      prefetch={false}
    >
      <i className="material-symbols-outlined">{iconName}</i>
    </Link>
  );
};

export const SecondaryItems: FC = memo(() => {

  const { data: isAdmin } = useIsAdmin();
  const { data: growiCloudUri } = useGrowiCloudUri();

  return (
    <div className={styles['grw-secondary-items']}>
      <PersonalDropdown />
      <SecondaryItem label="Help" iconName="help" href={growiCloudUri != null ? 'https://growi.cloud/help/' : 'https://docs.growi.org'} isBlank />
      {isAdmin && <SecondaryItem label="Admin" iconName="settings" href="/admin" />}
      <SecondaryItem label="Trash" href="/trash" iconName="delete" />
    </div>
  );
});
