import { analyticsPeriodSchema } from '@/lib/validation/entities';
import { analyticsSnapshotCsvRows } from '@/lib/data/analytics';
import { getAnalyticsFromDb } from '@/lib/firestore/app-data';
import { ensureSeeded } from '@/lib/firestore/seed';
import {
  ensureDb,
  handleRouteError,
  jsonData,
  requireAuth,
  useRemoteDb,
} from '@/lib/api/route-helpers';
import { localApi } from '@/lib/api/local-handlers';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = analyticsPeriodSchema.parse(searchParams.get('period') ?? 'overall');
    const format = searchParams.get('format');

    if (useRemoteDb()) {
      await ensureDb();
      requireAuth(request);
      await ensureSeeded();
    } else {
      requireAuth(request);
    }

    const snapshot = useRemoteDb()
      ? await getAnalyticsFromDb(period)
      : await localApi.analytics.snapshot(period);

    if (format === 'csv') {
      const rows = analyticsSnapshotCsvRows(snapshot);
      const headers = ['Section', 'Label', 'Value'];
      const lines = [
        headers.join(','),
        ...rows.map((r) =>
          [r.Section, r.Label, r.Value]
            .map((v) => `"${String(v).replace(/"/g, '""')}"`)
            .join(','),
        ),
      ];
      return new Response(lines.join('\r\n'), {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="analytics-${period}.csv"`,
        },
      });
    }

    return jsonData(snapshot);
  } catch (e) {
    return handleRouteError(e);
  }
}
