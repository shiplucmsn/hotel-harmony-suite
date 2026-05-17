import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import type { PaginationDto } from "@/modules/finance/types";

type PaginationBarProps = {
  pagination: PaginationDto;
  onPageChange: (page: number) => void;
  className?: string;
};

export function PaginationBar({ pagination, onPageChange, className }: PaginationBarProps) {
  const { page, perPage, total, lastPage } = pagination;
  const from = total === 0 ? 0 : (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);

  const pages = Array.from({ length: lastPage }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === lastPage || Math.abs(p - page) <= 1
  );

  return (
    <div className={cn("flex items-center justify-between border-t px-4 py-3", className)}>
      <p className="text-xs text-muted-foreground">
        Showing {from}–{to} of {total}
      </p>
      <Pagination className="m-0 w-auto justify-end">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (page > 1) onPageChange(page - 1);
              }}
              className={page <= 1 ? "pointer-events-none opacity-50" : undefined}
            />
          </PaginationItem>
          {pages.map((p, idx) => {
            const prev = pages[idx - 1];
            const showEllipsis = prev != null && p - prev > 1;
            return (
              <PaginationItem key={p}>
                {showEllipsis ? <span className="px-2 text-muted-foreground">…</span> : null}
                <PaginationLink
                  href="#"
                  isActive={p === page}
                  onClick={(e) => {
                    e.preventDefault();
                    onPageChange(p);
                  }}
                >
                  {p}
                </PaginationLink>
              </PaginationItem>
            );
          })}
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (page < lastPage) onPageChange(page + 1);
              }}
              className={page >= lastPage ? "pointer-events-none opacity-50" : undefined}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
