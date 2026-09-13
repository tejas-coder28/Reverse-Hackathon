import React from 'react';

/* ═══════════════════════════════════════════════════════════════════════════
   DataTable — desktop table that degrades to stacked rows on mobile.
   Presentation only.
   ═══════════════════════════════════════════════════════════════════════════ */

export interface DataTableColumn<T> {
  key: string;
  header: string;
  className?: string;
  render: (row: T) => React.ReactNode;
}

export function DataTable<T extends { id: string }>(props: {
  columns: Array<DataTableColumn<T>>;
  rows: T[];
  emptyMessage?: string;
}) {
  const { columns, rows, emptyMessage = 'No records found.' } = props;

  if (rows.length === 0) {
    return (
      <p className="px-4 py-10 text-center text-xs text-ink-500">{emptyMessage}</p>
    );
  }

  return (
    <React.Fragment>
      {/* Desktop: real table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-rule-500 bg-paper-200">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={
                    'px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.06em] text-ink-600 ' +
                    (col.className ?? '')
                  }
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-rule-400">
            {rows.map((row) => (
              <tr key={row.id} className="transition-colors hover:bg-paper-200/60">
                {columns.map((col) => (
                  <td key={col.key} className={'px-4 py-3 align-top ' + (col.className ?? '')}>
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: stacked rows */}
      <ul className="divide-y divide-rule-400 md:hidden">
        {rows.map((row) => (
          <li key={row.id} className="space-y-2 px-4 py-3">
            {columns.map((col) => (
              <div key={col.key} className="flex items-baseline justify-between gap-3">
                <span className="shrink-0 text-[10px] uppercase tracking-[0.06em] text-ink-500">
                  {col.header}
                </span>
                <span className="min-w-0 text-right text-xs">{col.render(row)}</span>
              </div>
            ))}
          </li>
        ))}
      </ul>
    </React.Fragment>
  );
}
