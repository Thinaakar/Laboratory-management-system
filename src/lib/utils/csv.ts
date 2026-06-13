function escapeCsvCell(value: string | number | undefined | null): string {
  const text = value == null ? '' : String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function rowsToCsv(rows: Record<string, string | number | undefined | null>[]): string {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const lines = [
    headers.join(','),
    ...rows.map((row) => headers.map((header) => escapeCsvCell(row[header])).join(',')),
  ];
  return lines.join('\r\n');
}

export function downloadCsv(filename: string, rows: Record<string, string | number | undefined | null>[]): void {
  if (!rows.length) return;
  const csv = rowsToCsv(rows);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export interface TableCsvColumn<T> {
  header: string;
  exportValue: (row: T) => string | number | undefined | null;
}

export function downloadTableCsv<T>(
  filename: string,
  columns: TableCsvColumn<T>[],
  data: T[],
): void {
  if (!data.length || !columns.length) return;
  const rows = data.map((row) =>
    columns.reduce<Record<string, string | number | undefined | null>>((acc, col) => {
      acc[col.header] = col.exportValue(row);
      return acc;
    }, {}),
  );
  downloadCsv(filename, rows);
}
