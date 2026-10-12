import mongoose, { Types } from 'mongoose';

import { prisma } from '~/utils/prisma';

import type { AiUsageLogInput } from './ai-usage-log';

const NINETY_DAYS_IN_SECONDS = 90 * 24 * 60 * 60;

const readRawRecordsOf = (userId: string) =>
  mongoose.connection
    .collection('aiusagelogs')
    .find({ userId: new Types.ObjectId(userId) })
    .toArray();

describe('aiusagelogs collection', () => {
  it('has a TTL index on createdAt that expires records after 90 days', async () => {
    const AiUsageLog = mongoose.model('AiUsageLog');
    await AiUsageLog.init();

    const indexes = await AiUsageLog.collection.indexes();
    const ttlIndex = indexes.find((index) => index.key.createdAt === 1);

    expect(ttlIndex?.expireAfterSeconds).toBe(NINETY_DAYS_IN_SECONDS);
  });
});

describe('prisma.aiusagelogs.createLog', () => {
  const userId = new Types.ObjectId().toString();

  afterEach(async () => {
    await prisma.aiusagelogs.deleteMany({ where: { userId } });
  });

  it('writes one record carrying every input field and the record time', async () => {
    const input: AiUsageLogInput = {
      userId,
      feature: 'chat',
      provider: 'openai',
      modelId: 'gpt-4.1',
      callCount: 3,
      usage: {
        inputTokens: 1200,
        outputTokens: 340,
        reasoningTokens: 40,
        cacheReadTokens: 800,
        cacheWriteTokens: 100,
      },
      estimatedCostUsd: 0.0123,
      weightedUnits: 12.5,
      baseModelKey: 'openai/gpt-4.1-mini',
    };
    const before = new Date();

    await prisma.aiusagelogs.createLog(input);

    const records = await readRawRecordsOf(userId);
    expect(records).toHaveLength(1);
    const [record] = records;
    expect(record).toMatchObject({
      feature: 'chat',
      provider: 'openai',
      modelId: 'gpt-4.1',
      callCount: 3,
      inputTokens: 1200,
      outputTokens: 340,
      reasoningTokens: 40,
      cacheReadTokens: 800,
      cacheWriteTokens: 100,
      estimatedCostUsd: 0.0123,
      weightedUnits: 12.5,
      baseModelKey: 'openai/gpt-4.1-mini',
    });
    expect(record.createdAt).toBeInstanceOf(Date);
    expect(record.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
  });

  it('stores absent values as explicit nulls instead of omitting the fields', async () => {
    await prisma.aiusagelogs.createLog({
      userId,
      feature: 'thread-title',
      provider: 'anthropic',
      modelId: 'claude-haiku',
      callCount: 1,
      usage: {
        inputTokens: 50,
        outputTokens: 10,
        reasoningTokens: null,
        cacheReadTokens: null,
        cacheWriteTokens: null,
      },
      estimatedCostUsd: null,
      weightedUnits: null,
      baseModelKey: null,
    });

    const [record] = await readRawRecordsOf(userId);
    // `toHaveProperty(key, null)` fails for a missing key, so this proves the
    // field was written rather than omitted.
    for (const field of [
      'reasoningTokens',
      'cacheReadTokens',
      'cacheWriteTokens',
      'estimatedCostUsd',
      'weightedUnits',
      'baseModelKey',
    ]) {
      expect(record).toHaveProperty(field, null);
    }
  });
});
