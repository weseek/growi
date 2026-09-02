import { mockDeep } from 'vitest-mock-extended';

import type { PrismaClient } from '../prisma-client.js';
import { createChannelPermissionRepository } from './channel-permission-repository.js';

describe('channelPermissionRepository.find', () => {
  it('returns the permitted channels for (relationId, commandName)', async () => {
    const prisma = mockDeep<PrismaClient>();
    prisma.channelPermission.findUnique.mockResolvedValue({
      id: 'perm-1',
      relationId: 'relation-1',
      commandName: 'search',
      channels: ['C0001', 'C0002'],
    });
    const repository = createChannelPermissionRepository(prisma);

    await expect(repository.find('relation-1', 'search')).resolves.toEqual([
      'C0001',
      'C0002',
    ]);
  });

  it('distinguishes "no row" (no-settings) from an explicit empty restriction', async () => {
    const prisma = mockDeep<PrismaClient>();
    prisma.channelPermission.findUnique.mockResolvedValue(null);
    const repository = createChannelPermissionRepository(prisma);

    await expect(repository.find('relation-1', 'search')).resolves.toBeNull();
  });
});

describe('channelPermissionRepository.upsert', () => {
  it('upserts by the (relationId, commandName) unique key', async () => {
    const prisma = mockDeep<PrismaClient>();
    prisma.channelPermission.upsert.mockResolvedValue({
      id: 'perm-1',
      relationId: 'relation-1',
      commandName: 'search',
      channels: ['C0001'],
    });
    const repository = createChannelPermissionRepository(prisma);

    await repository.upsert('relation-1', 'search', ['C0001']);

    expect(prisma.channelPermission.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          relationId_commandName: {
            relationId: 'relation-1',
            commandName: 'search',
          },
        },
      }),
    );
  });
});

describe('channelPermissionRepository.deleteByRelation (unpairing)', () => {
  it('deletes every row for the relation and answers the count removed', async () => {
    const prisma = mockDeep<PrismaClient>();
    prisma.channelPermission.deleteMany.mockResolvedValue({ count: 3 });
    const repository = createChannelPermissionRepository(prisma);

    await expect(repository.deleteByRelation('relation-1')).resolves.toBe(3);
    expect(prisma.channelPermission.deleteMany).toHaveBeenCalledWith({
      where: { relationId: 'relation-1' },
    });
  });
});
