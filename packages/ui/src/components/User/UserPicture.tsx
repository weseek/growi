import React, {
  forwardRef, Ref, useCallback, useRef,
} from 'react';

import type { Ref as MongooseRef, IUser } from '@growi/core';
import { pagePathUtils } from '@growi/core';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';

const UncontrolledTooltip = dynamic(() => import('reactstrap').then(mod => mod.UncontrolledTooltip), { ssr: false });

const { userPageRoot } = pagePathUtils;

const DEFAULT_IMAGE = '/images/icons/user.svg';


type UserPictureRootProps = {
  user: Partial<IUser>,
  className?: string,
  children?: React.ReactNode,
}

type IUserPictureRootElm =
  (React.ForwardRefExoticComponent<UserPictureRootProps & React.RefAttributes<HTMLSpanElement>>)
  | ((props: UserPictureRootProps) => JSX.Element);

const UserPictureRootWithoutLink = forwardRef((props: UserPictureRootProps, ref: Ref<HTMLSpanElement>) => {
  return <span ref={ref} className={props.className}>{props.children}</span>;
});

const UserPictureRootWithLink = forwardRef((props: UserPictureRootProps, ref: Ref<HTMLSpanElement>) => {
  const router = useRouter();

  const { user } = props;
  const href = userPageRoot(user);

  const clickHandler = useCallback(() => {
    router.push(href);
  }, [href, router]);

  // Using <span> tag here instead of <a> tag because UserPicture is used in SearchResultList which is essentially a anchor tag.
  // Nested anchor tags causes a warning.
  // https://stackoverflow.com/questions/13052598/creating-anchor-tag-inside-anchor-taga
  return <span ref={ref} className={props.className} onClick={clickHandler} style={{ cursor: 'pointer' }}>{props.children}</span>;
});

// wrapper with Tooltip
const withTooltip = (UserPictureRoot: IUserPictureRootElm): IUserPictureRootElm => {
  return (props: UserPictureRootProps) => {
    const { user } = props;

    const userPictureRef = useRef<HTMLSpanElement>(null);

    return (
      <>
        <UserPictureRoot ref={userPictureRef} user={user}>{props.children}</UserPictureRoot>
        <UncontrolledTooltip placement="bottom" target={userPictureRef} delay={0} fade={false}>
          @{user.username}<br />
          {user.name}
        </UncontrolledTooltip>
      </>
    );
  };
};


/**
 * type guard to determine whether the specified object is IUser
 */
const isUserObj = (obj: Partial<IUser> | MongooseRef<IUser>): obj is Partial<IUser> => {
  return typeof obj !== 'string' && 'username' in obj;
};


type Props = {
  user?: Partial<IUser> | MongooseRef<IUser> | null,
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl',
  noLink?: boolean,
  noTooltip?: boolean,
};

export const UserPicture = React.memo((props: Props): JSX.Element => {

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
  let UserPictureRootElm: IUserPictureRootElm = noLink ? UserPictureRootWithoutLink : UserPictureRootWithLink;
  if (!noTooltip) {
    UserPictureRootElm = withTooltip(UserPictureRootElm);
  }

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
