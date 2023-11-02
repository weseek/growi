import {
  type ReactNode,
  memo, forwardRef, useCallback, useRef,
} from 'react';

import { type Ref, type IUser, isUserObj } from '@growi/core';
import { pagePathUtils } from '@growi/core/dist/utils';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import type { UncontrolledTooltipProps } from 'reactstrap';

const UncontrolledTooltip = dynamic<UncontrolledTooltipProps>(() => import('reactstrap').then(mod => mod.UncontrolledTooltip), { ssr: false });

const DEFAULT_IMAGE = '/images/icons/user.svg';


type UserPictureRootProps = {
  user: Partial<IUser>,
  className?: string,
  children?: ReactNode,
}

const UserPictureRootWithoutLink = forwardRef<HTMLSpanElement, UserPictureRootProps>((props, ref) => {
  return <span ref={ref} className={props.className}>{props.children}</span>;
});

const UserPictureRootWithLink = forwardRef<HTMLSpanElement, UserPictureRootProps>((props, ref) => {
  const router = useRouter();

  const { user } = props;
  const href = pagePathUtils.userHomepagePath(user);

  const clickHandler = useCallback(() => {
    router.push(href);
  }, [href, router]);

  // Using <span> tag here instead of <a> tag because UserPicture is used in SearchResultList which is essentially a anchor tag.
  // Nested anchor tags causes a warning.
  // https://stackoverflow.com/questions/13052598/creating-anchor-tag-inside-anchor-taga
  return <span ref={ref} className={props.className} onClick={clickHandler} style={{ cursor: 'pointer' }}>{props.children}</span>;
});


// wrapper with Tooltip
const withTooltip = (UserPictureSpanElm: React.ForwardRefExoticComponent<UserPictureRootProps & React.RefAttributes<HTMLSpanElement>>) => {
  return (props: UserPictureRootProps) => {
    const { user } = props;

    const userPictureRef = useRef<HTMLSpanElement>(null);

    return (
      <>
        <UserPictureSpanElm ref={userPictureRef} user={user}>{props.children}</UserPictureSpanElm>
        <UncontrolledTooltip placement="bottom" target={userPictureRef} delay={0} fade={false}>
          @{user.username}<br />
          {user.name}
        </UncontrolledTooltip>
      </>
    );
  };
};


type Props = {
  user?: Partial<IUser> | Ref<IUser> | null,
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl',
  noLink?: boolean,
  noTooltip?: boolean,
};

export const UserPicture = memo((props: Props): JSX.Element => {

  const {
    user, size, noLink, noTooltip,
  } = props;

  const classNames = ['rounded-circle', 'picture'];
  if (size != null) {
    classNames.push(`picture-${size}`);
  }
  const className = classNames.join(' ');

  if (user == null || !isUserObj(user)) {
    return (
      <img
        src={DEFAULT_IMAGE}
        alt="someone"
        className={className}
      />
    );
  }

  // determine RootElm
  const UserPictureSpanElm = noLink ? UserPictureRootWithoutLink : UserPictureRootWithLink;
  const UserPictureRootElm = noTooltip
    ? UserPictureSpanElm
    : withTooltip(UserPictureSpanElm);

  const userPictureSrc = user.imageUrlCached ?? DEFAULT_IMAGE;

  return (
    <UserPictureRootElm user={user}>
      <img
        src={userPictureSrc}
        alt={user.username}
        className={className}
      />
    </UserPictureRootElm>
  );
});
UserPicture.displayName = 'UserPicture';
