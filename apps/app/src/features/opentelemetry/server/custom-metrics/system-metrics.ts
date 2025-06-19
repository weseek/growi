import * as os from 'os';
import * as process from 'process';

import { diag, metrics } from '@opentelemetry/api';

const logger = diag.createComponentLogger({ namespace: 'growi:custom-metrics:system' });

export interface SystemMetricsConfig {
  enabled: boolean;
  collectionInterval: number;
}

let lastCpuUsage: NodeJS.CpuUsage | null = null;

function calculateCpuUsage(intervalMs: number): number | null {
  try {
    const currentUsage = process.cpuUsage();

    if (lastCpuUsage === null) {
      lastCpuUsage = currentUsage;
      return null; // 最初の計測では使用率を計算できない
    }

    const userDiff = currentUsage.user - lastCpuUsage.user;
    const systemDiff = currentUsage.system - lastCpuUsage.system;
    const totalDiff = userDiff + systemDiff;

    // マイクロ秒を秒に変換し、収集間隔で割って使用率を計算
    const intervalUs = intervalMs * 1000; // マイクロ秒に変換
    const usage = (totalDiff / intervalUs) * 100;

    lastCpuUsage = currentUsage;

    // 0-100%の範囲でクランプ
    return Math.min(Math.max(usage, 0), 100);
  }
  catch (error) {
    logger.error('Failed to calculate CPU usage', { error });
    return null;
  }
}

function getMemoryInfo(): { used: number; total: number; usagePercent: number } {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const used = totalMem - freeMem;
  const usagePercent = (used / totalMem) * 100;

  return {
    used,
    total: totalMem,
    usagePercent,
  };
}

export function addSystemMetrics(config: SystemMetricsConfig): void {
  if (!config.enabled) {
    logger.debug('System metrics collection is disabled');
    return;
  }

  logger.info('Starting system metrics collection');

  const meter = metrics.getMeter('growi-system-metrics', '1.0.0');

  // CPU usage
  const cpuUsageGauge = meter.createObservableGauge('growi.system.cpu.usage', {
    description: 'CPU usage percentage',
    unit: '%',
  });

  // System memory usage
  const memoryUsageGauge = meter.createObservableGauge('growi.system.memory.usage', {
    description: 'System memory usage in bytes',
    unit: 'bytes',
  });

  const memoryUsagePercentGauge = meter.createObservableGauge('growi.system.memory.usage_percent', {
    description: 'System memory usage percentage',
    unit: '%',
  });
  // Process memory usage
  const processMemoryHeapGauge = meter.createObservableGauge('growi.process.memory.heap.used', {
    description: 'Process heap memory usage in bytes',
    unit: 'bytes',
  });

  const processMemoryRssGauge = meter.createObservableGauge('growi.process.memory.rss', {
    description: 'Process resident set size in bytes',
    unit: 'bytes',
  });

  // Metrics collection callback
  meter.addBatchObservableCallback(
    (result) => {
      try {
        // CPU usage
        const cpuUsage = calculateCpuUsage(config.collectionInterval);
        if (cpuUsage !== null) {
          result.observe(cpuUsageGauge, cpuUsage, {
            'host.name': os.hostname(),
          });
        }

        // System memory
        const memoryInfo = getMemoryInfo();
        result.observe(memoryUsageGauge, memoryInfo.used, {
          'host.name': os.hostname(),
        });
        result.observe(memoryUsagePercentGauge, memoryInfo.usagePercent, {
          'host.name': os.hostname(),
        });

        // Process memory
        const processMemory = process.memoryUsage();
        result.observe(processMemoryHeapGauge, processMemory.heapUsed, {
          'process.pid': process.pid.toString(),
        });
        result.observe(processMemoryRssGauge, processMemory.rss, {
          'process.pid': process.pid.toString(),
        });
      }
      catch (error) {
        logger.error('Failed to collect system metrics', { error });
      }
    },
    [cpuUsageGauge, memoryUsageGauge, memoryUsagePercentGauge, processMemoryHeapGauge, processMemoryRssGauge],
  );

  logger.info('System metrics collection started successfully');
}
