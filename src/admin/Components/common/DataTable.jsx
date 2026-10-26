import React from 'react';

/**
 * Reusable DataTable Component
 * Provides unified, consistent table layout, styling, headers, alternating hover states,
 * empty state handling, and integrated responsive mobile card rendering across all admin panels.
 */
export default function DataTable({
  columns = [],
  data = [],
  keyField = 'id',
  emptyMessage = 'No data available.',
  onRowClick,
  mobileCardRender,
  className = '',
}) {
  const getRowKey = (item, index) => {
    if (typeof keyField === 'function') return keyField(item, index);
    return item[keyField] || item.docId || item.id || index;
  };

  return (
    <div className={`space-y-4 ${className}`}>

      {/* 1. Mobile Cards View (Visible only on mobile screens if mobileCardRender is provided) */}
      {mobileCardRender && (
        <div className="block md:hidden space-y-4">
          {data.length === 0 ? (
            <div className="bg-card p-8 text-center text-text-muted rounded-2xl border border-border-subtle shadow-xs text-xs font-bold">
              {emptyMessage}
            </div>
          ) : (
            data.map((item, index) => mobileCardRender(item, index))
          )}
        </div>
      )}

      {/* 2. Desktop & Tablet Data Table (Always formatted consistently) */}
      <div className={`${mobileCardRender ? 'hidden md:block' : 'block'} bg-card rounded-2xl border border-border-subtle shadow-xs overflow-hidden text-xs`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-subtle bg-bg-base text-text-muted text-[11px] font-black uppercase tracking-wider">
                {columns.map((col, idx) => (
                  <th
                    key={col.key || idx}
                    className={`px-5 py-3.5 ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'} ${col.className || ''}`}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle text-text-base font-semibold">
              {data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center text-text-muted font-bold text-xs">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                data.map((item, rowIndex) => (
                  <tr
                    key={getRowKey(item, rowIndex)}
                    onClick={() => onRowClick && onRowClick(item, rowIndex)}
                    className={`hover:bg-card-hover transition-colors duration-150 align-middle ${onRowClick ? 'cursor-pointer group' : ''}`}
                  >
                    {columns.map((col, colIdx) => (
                      <td
                        key={col.key || colIdx}
                        className={`px-5 py-4 ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'} ${col.cellClassName || ''}`}
                      >
                        {col.render ? col.render(item, rowIndex) : (col.key ? item[col.key] : '')}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
