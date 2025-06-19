import { addApplicationMetrics, type ApplicationMetricsConfig } from './application-metrics';
import { addSystemMetrics, type SystemMetricsConfig } from './system-metrics';

export { addSystemMetrics, type SystemMetricsConfig } from './system-metrics';
export { addApplicationMetrics, type ApplicationMetricsConfig } from './application-metrics';

export interface CustomMetricsConfig {
  systemMetrics: SystemMetricsConfig;
  applicationMetrics: ApplicationMetricsConfig;
}

export function addCustomMetrics(config: CustomMetricsConfig): void {
  addSystemMetrics(config.systemMetrics);
  addApplicationMetrics(config.applicationMetrics);
}
