// metrics収集の登録が目的。登録するだけなので、return なし
import { diag, metrics } from '@opentelemetry/api'; // opentelemetryのapiを使うためにimport

import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:opentelemetry:custom-metrics:page-counts');
const loggerDiag = diag.createComponentLogger({ namespace: 'growi:custom-metrics:page-counts' }); // OTelようのlogger

export function addPageCountsMetrics(): void {
  logger.info('Starting page counts metrics collection');

  const meter = metrics.getMeter('growi-page-counts-metrics', '1.0.0');
  // metrics.getMeter(...) は、OpenTelemetry でメトリクスを記録するための「測定器」
  // getMeter の役割は、「メトリクスの登録・更新を管理するオブジェクトを取得する」こと。
  // metrics.getMeter("メーターの名前（なんでもOK）", "バージョン情報（任意）")

  const pageCountGauge = meter.createObservableGauge('growi-pages.total', { // 現在の値を定期的に観測するための器。gaugeは水道メーターのようなもので、名前を 'growi.users.total' にすることで、PrometheusやGrafanaで「この名前の数値」を扱えるようになる。
    description: 'Total number of pages in GROWI',
    unit: 'pages',
  });

  meter.addBatchObservableCallback( // Otelに定期的に実行する関数を登録
    async(result) => {
      try {
        const { growiInfoService } = await import('~/server/service/growi-info');

        const growiInfo = await growiInfoService.getGrowiInfo(true);

        console.log('デバッグ currentPagesCount:', growiInfo.additionalInfo?.currentPagesCount);

        result.observe(pageCountGauge, growiInfo.additionalInfo?.currentPagesCount || 0);
        // このプロパティが存在しない場合があるため、growiInfo.additionalInfo の中身を console.log で確認しておくと安心です。
      }
      catch (error) {
        loggerDiag.error('Failed to collect page counts metrics', { error });
      }
    },
    [pageCountGauge],
  );
  logger.info('Page counts metrics collection started successfully');
}
