import React from 'react';
import { MoreHorizontalIcon } from 'lucide-react';
import { Badge } from './Badge';
import { Skeleton } from './Skeleton';
interface Column<T> {
  key: string;
  header: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: T, index: number) => React.ReactNode;
}
interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  mode?: 'comfortable' | 'dense';
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T, index: number) => void;
  rowActions?: (row: T, index: number) => React.ReactNode;
  className?: string;
}
export function Table<T extends Record<string, any>>({
  columns,
  data,
  mode = 'comfortable',
  loading = false,
  emptyMessage = 'No data available',
  onRowClick,
  rowActions,
  className = ''
}: TableProps<T>) {
  const paddingStyles = {
    comfortable: 'px-4 py-3',
    dense: 'px-3 py-2'
  };
  const alignStyles = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };
  if (loading) {
    return (
      <div
        className={`rounded-xl border border-stroke-hairline overflow-hidden ${className}`}>

        <div className="bg-surface-primary/60 backdrop-blur-xl">
          {/* Header skeleton */}
          <div className="flex border-b border-stroke-hairline">
            {columns.map((col, i) =>
            <div
              key={i}
              className={`${paddingStyles[mode]} flex-1`}
              style={{
                width: col.width
              }}>

                <Skeleton variant="text" width="60%" height={14} />
              </div>
            )}
          </div>
          {/* Row skeletons */}
          {Array.from({
            length: 5
          }).map((_, rowIndex) =>
          <div
            key={rowIndex}
            className="flex border-b border-stroke-hairline last:border-0">

              {columns.map((col, colIndex) =>
            <div
              key={colIndex}
              className={`${paddingStyles[mode]} flex-1`}
              style={{
                width: col.width
              }}>

                  <Skeleton
                variant="text"
                width={colIndex === 0 ? '80%' : '60%'}
                height={16} />

                </div>
            )}
            </div>
          )}
        </div>
      </div>);

  }
  if (data.length === 0) {
    return (
      <div
        className={`rounded-xl border border-stroke-hairline overflow-hidden ${className}`}>

        <div className="bg-surface-primary/60 backdrop-blur-xl">
          {/* Header */}
          <div className="flex border-b border-stroke-hairline">
            {columns.map((col, i) =>
            <div
              key={i}
              className={`${paddingStyles[mode]} flex-1 text-sm font-medium text-text-tertiary ${alignStyles[col.align || 'left']}`}
              style={{
                width: col.width
              }}>

                {col.header}
              </div>
            )}
          </div>
          {/* Empty state */}
          <div className="py-12 text-center text-text-tertiary">
            {emptyMessage}
          </div>
        </div>
      </div>);

  }
  return (
    <div
      className={`rounded-xl border border-stroke-hairline overflow-hidden ${className}`}>

      <div className="bg-surface-primary/60 backdrop-blur-xl overflow-x-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-surface-primary/95 backdrop-blur-xl z-10">
            <tr className="border-b border-stroke-hairline">
              {columns.map((col, i) =>
              <th
                key={i}
                className={`${paddingStyles[mode]} text-sm font-medium text-text-tertiary ${alignStyles[col.align || 'left']}`}
                style={{
                  width: col.width
                }}>

                  {col.header}
                </th>
              )}
              {rowActions && <th className="w-12" />}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) =>
            <tr
              key={rowIndex}
              className={`
                  border-b border-stroke-hairline last:border-0
                  transition-colors duration-fast
                  ${onRowClick ? 'cursor-pointer hover:bg-surface-hover' : ''}
                `}
              onClick={() => onRowClick?.(row, rowIndex)}>

                {columns.map((col, colIndex) =>
              <td
                key={colIndex}
                className={`${paddingStyles[mode]} text-sm text-text-primary ${alignStyles[col.align || 'left']}`}
                style={{
                  width: col.width
                }}>

                    {col.render ?
                col.render(row[col.key], row, rowIndex) :
                row[col.key]}
                  </td>
              )}
                {rowActions &&
              <td className={`${paddingStyles[mode]} text-right`}>
                    {rowActions(row, rowIndex)}
                  </td>
              }
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>);

}
// Status pill component for use in tables
interface StatusPillProps {
  status: 'active' | 'inactive' | 'pending' | 'completed' | 'error';
  label?: string;
}
export function StatusPill({ status, label }: StatusPillProps) {
  const statusConfig = {
    active: {
      color: 'success' as const,
      defaultLabel: 'Active'
    },
    inactive: {
      color: 'neutral' as const,
      defaultLabel: 'Inactive'
    },
    pending: {
      color: 'warning' as const,
      defaultLabel: 'Pending'
    },
    completed: {
      color: 'info' as const,
      defaultLabel: 'Completed'
    },
    error: {
      color: 'danger' as const,
      defaultLabel: 'Error'
    }
  };
  const config = statusConfig[status];
  return (
    <Badge color={config.color} dot size="sm">
      {label || config.defaultLabel}
    </Badge>);

}