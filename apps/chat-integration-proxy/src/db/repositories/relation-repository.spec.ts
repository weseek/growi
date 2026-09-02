// Nothing on `relation` is encrypted, so these tests are about the other half
// of this repository's job: keeping one workspace's several GROWI pairings
// apart (Requirement 8.1) and mapping columns onto the `Relation` type the
// layers to the right read.
import { mockDeep } from 'vitest-mock-extended';

import type { PrismaClient } from '../prisma-client.js';
import { createRelationRepository } from './relation-repository.js';

const row = (overrides: Partial<Record<string, unknown>> = {}) => ({
  id: 'relation-1',
  installationId: 'installation-1',
  growiUri: 'https://wiki.example.com',
  growiLabel: 'Wiki',
  searchWeight: 1,
  settingsVersion: 0,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  ...overrides,
});

describe('relationRepository (Requirement 8.1)', () => {
  it('returns every GROWI paired with one workspace, not just the first', async () => {
    const prisma = mockDeep<PrismaClient>();
    prisma.relation.findMany.mockResolvedValue([
      row(),
      row({
        id: 'relation-2',
        growiUri: 'https://wiki2.example.com',
        growiLabel: 'Second wiki',
        searchWeight: 3,
      }),
    ]);
    const repository = createRelationRepository(prisma);

    const relations = await repository.listByInstallation('installation-1');

    expect(relations.map((relation) => relation.growiUri)).toEqual([
      'https://wiki.example.com',
      'https://wiki2.example.com',
    ]);
    expect(relations[1].searchWeight).toBe(3);
  });

  it('finds one pairing by installation and GROWI URL together', async () => {
    // `growi_uri` alone is not unique: two workspaces may each pair the same
    // GROWI, and answering with the wrong workspace's relation would sign a
    // request with another workspace's key.
    const prisma = mockDeep<PrismaClient>();
    prisma.relation.findUnique.mockResolvedValue(row());
    const repository = createRelationRepository(prisma);

    await repository.findByGrowiUri(
      'installation-1',
      'https://wiki.example.com',
    );

    expect(prisma.relation.findUnique.mock.calls[0][0].where).toEqual({
      installationId_growiUri: {
        installationId: 'installation-1',
        growiUri: 'https://wiki.example.com',
      },
    });
  });

  it('maps the stored columns onto the Relation the right-hand layers read', async () => {
    const prisma = mockDeep<PrismaClient>();
    prisma.relation.findUnique.mockResolvedValue(row());
    const repository = createRelationRepository(prisma);

    await expect(repository.findById('relation-1')).resolves.toEqual({
      relationId: 'relation-1',
      installationId: 'installation-1',
      growiUri: 'https://wiki.example.com',
      growiLabel: 'Wiki',
      searchWeight: 1,
      settingsVersion: 0,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    });
  });

  it('answers null for a relation that does not exist', async () => {
    const prisma = mockDeep<PrismaClient>();
    prisma.relation.findUnique.mockResolvedValue(null);
    const repository = createRelationRepository(prisma);

    await expect(repository.findById('relation-missing')).resolves.toBeNull();
  });

  it('creates a pairing under the installation it was asked for', async () => {
    const prisma = mockDeep<PrismaClient>();
    prisma.relation.create.mockResolvedValue(row());
    const repository = createRelationRepository(prisma);

    const created = await repository.create({
      installationId: 'installation-1',
      growiUri: 'https://wiki.example.com',
      growiLabel: 'Wiki',
      searchWeight: 1,
      settingsVersion: 0,
    });

    expect(prisma.relation.create.mock.calls[0][0].data).toEqual({
      installationId: 'installation-1',
      growiUri: 'https://wiki.example.com',
      growiLabel: 'Wiki',
      searchWeight: 1,
      settingsVersion: 0,
    });
    expect(created.relationId).toBe('relation-1');
  });
});
