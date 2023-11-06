import React, { useCallback, useState } from 'react';

import { pagePathUtils } from '@growi/core/dist/utils';
import { format } from 'date-fns';
import { useRouter } from 'next/router';

import { createPage, exist } from '~/client/services/page-operation';
import { toastError } from '~/client/util/toastr';
import { useCurrentUser } from '~/stores/context';
import { useSWRxCurrentPage } from '~/stores/page';
import loggerFactory from '~/utils/logger';

import { PageCreateButtonDropdownMenu } from './PageCreateButtonDropdownMenu';
import { CreateButton } from './CreateButton';
import { DropendToggle } from './DropendToggle';

const logger = loggerFactory('growi:cli:PageCreateButton');

export const PageCreateButton = React.memo((): JSX.Element => {
  const router = useRouter();
  const { data: currentPage, isLoading } = useSWRxCurrentPage();
  const { data: currentUser } = useCurrentUser();

  const [isHovered, setIsHovered] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const now = format(new Date(), 'yyyy/MM/dd');
  const userHomepagePath = pagePathUtils.userHomepagePath(currentUser);
  const todaysPath = `${userHomepagePath}/memo/${now}`;

  const onMouseEnterHandler = () => {
    setIsHovered(true);
  };

  const onMouseLeaveHandler = () => {
    setIsHovered(false);
  };

  const onClickCreateNewPageButtonHandler = useCallback(async() => {
    if (isLoading) return;

    try {
      setIsCreating(true);

      const parentPath = currentPage == null
        ? '/'
        : currentPage.path;

      const params = {
        isSlackEnabled: false,
        slackChannels: '',
        grant: currentPage?.grant || 1,
        pageTags: [],
        grantUserGroupId: currentPage?.grantedGroup?._id,
        shouldGeneratePath: true,
      };

      const response = await createPage(parentPath, '', params);

      router.push(`${response.page.id}#edit`);
    }
    catch (err) {
      logger.warn(err);
      toastError(err);
    }
    finally {
      setIsCreating(false);
    }
  }, [currentPage, isLoading, router]);

  const onClickCreateTodaysButtonHandler = useCallback(async() => {
    if (currentUser == null) {
      return;
    }

    try {
      setIsCreating(true);

      // TODO: get grant, grantUserGroupId data from parent page
      // https://redmine.weseek.co.jp/issues/133892
      const params = {
        isSlackEnabled: false,
        slackChannels: '',
        grant: 1,
        pageTags: [],
      };

      const res = await exist(JSON.stringify([todaysPath]));
      if (!res.pages[todaysPath]) {
        await createPage(todaysPath, '', params);
      }

      router.push(`${todaysPath}#edit`);
    }
    catch (err) {
      logger.warn(err);
      toastError(err);
    }
    finally {
      setIsCreating(false);
    }
  }, [currentUser, router, todaysPath]);

  const onClickTemplateForChildrenButtonHandler = useCallback(async() => {
    if (isLoading) return;

    try {
      setIsCreating(true);

      const path = currentPage == null || currentPage.path === '/'
        ? '/_template'
        : `${currentPage.path}/_template`;

      const params = {
        isSlackEnabled: false,
        slackChannels: '',
        grant: currentPage?.grant || 1,
        pageTags: [],
        grantUserGroupId: currentPage?.grantedGroup?._id,
      };

      const res = await exist(JSON.stringify([path]));
      if (!res.pages[path]) {
        await createPage(path, '', params);
      }

      router.push(`${path}#edit`);
    }
    catch (err) {
      logger.warn(err);
      toastError(err);
    }
    finally {
      setIsCreating(false);
    }
  }, [currentPage, isLoading, router]);

  const onClickTemplateForDescendantsButtonHandler = useCallback(async() => {
    if (isLoading) return;

    try {
      setIsCreating(true);

      const path = currentPage == null || currentPage.path === '/'
        ? '/__template'
        : `${currentPage.path}/__template`;

      const params = {
        isSlackEnabled: false,
        slackChannels: '',
        grant: currentPage?.grant || 1,
        pageTags: [],
        grantUserGroupId: currentPage?.grantedGroup?._id,
      };

      const res = await exist(JSON.stringify([path]));
      if (!res.pages[path]) {
        await createPage(path, '', params);
      }

      router.push(`${path}#edit`);
    }
    catch (err) {
      logger.warn(err);
      toastError(err);
    }
    finally {
      setIsCreating(false);
    }
  }, [currentPage, isLoading, router]);

  // TODO: update button design
  // https://redmine.weseek.co.jp/issues/132683
  return (
    <div
      className="d-flex flex-row"
      onMouseEnter={onMouseEnterHandler}
      onMouseLeave={onMouseLeaveHandler}
    >
      <div className="btn-group flex-grow-1">
        <CreateButton
          className="z-2"
          onClick={onClickCreateNewPageButtonHandler}
          disabled={isCreating}
        />
      </div>
      {isHovered && (
        <div className="btn-group dropend position-absolute">
          <DropendToggle
            className="dropdown-toggle dropdown-toggle-split"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          />
          <PageCreateButtonDropdownMenu
            todaysPath={todaysPath}
            onClickCreateNewPageButtonHandler={onClickCreateNewPageButtonHandler}
            onClickCreateTodaysButtonHandler={onClickCreateTodaysButtonHandler}
            onClickTemplateForChildrenButtonHandler={onClickTemplateForChildrenButtonHandler}
            onClickTemplateForDescendantsButtonHandler={onClickTemplateForDescendantsButtonHandler}
          />
        </div>
      )}
    </div>
  );
});
