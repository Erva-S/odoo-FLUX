import React from "react";
import clsx from "clsx";

interface NeoTableColumn<T> {
  header: string;
  accessorKey?: keyof T | string;
  render?: (row: T, index: number) => React.ReactNode;
  align?: "left" | "center" | "right";
  className?: string;
}

interface NeoTableProps<T> {
  columns: NeoTableColumn<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
  emptyState?: React.ReactNode;
  isLoading?: boolean;
  className?: string;
}

export function NeoTable<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  emptyState,
  isLoading,
  className,
}: NeoTableProps<T>) {
  return (
    <div
      className={clsx(
        "border-2 border-black rounded-[14px] bg-neoWhite shadow-neo overflow-hidden flex flex-col w-full",
        className
      )}
    >
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-neoBlack text-neoWhite sticky top-0 z-10 select-none">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={clsx(
                    "py-3.5 px-4 font-heading font-extrabold text-sm uppercase tracking-wider border-b-2 border-black",
                    col.align === "right" && "text-right",
                    col.align === "center" && "text-center",
                    col.className
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-neoDivider text-sm">
            {isLoading ? (
              // Skeleton loading rows matching neo-brutalist style
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={`skeleton-${i}`} className="bg-neoWhite">
                  {columns.map((_, colIdx) => (
                    <td key={colIdx} className="py-4 px-4">
                      <div className="h-5 bg-neoCanvas border-2 border-black/20 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-12 px-4 text-center">
                  {emptyState || (
                    <div className="text-neutral-500 font-medium">No records found.</div>
                  )}
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => (
                <tr
                  key={keyExtractor(row)}
                  onClick={() => onRowClick && onRowClick(row)}
                  tabIndex={onRowClick ? 0 : undefined}
                  onKeyDown={(e) => {
                    if (onRowClick && (e.key === "Enter" || e.key === " ")) {
                      e.preventDefault();
                      onRowClick(row);
                    }
                  }}
                  className={clsx(
                    "transition-colors duration-150 group",
                    onRowClick && "cursor-pointer focus:outline-none focus:bg-neoYellow/30",
                    "hover:bg-neoYellow"
                  )}
                >
                  {columns.map((col, colIdx) => {
                    let content: React.ReactNode = null;
                    if (col.render) {
                      content = col.render(row, rowIdx);
                    } else if (col.accessorKey) {
                      content = (row as any)[col.accessorKey];
                    }

                    return (
                      <td
                        key={colIdx}
                        className={clsx(
                          "py-3.5 px-4 text-neoBlack font-medium whitespace-nowrap",
                          col.align === "right" && "text-right tnum",
                          col.align === "center" && "text-center",
                          col.className
                        )}
                      >
                        {content}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

