import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRightIcon } from 'lucide-react';
import { REIL_APP_NAME } from '../../constants/brand';

export interface ReilBreadcrumbItem {
  label: string;
  path?: string;
}

interface ReilBreadcrumbProps {
  items: ReilBreadcrumbItem[];
  className?: string;
}

/** Breadcrumb for Q REIL pages. First segment is always REIL_APP_NAME linking to /reil. */
export function ReilBreadcrumb({ items, className = '' }: ReilBreadcrumbProps) {
  const navigate = useNavigate();
  const segments = [{ label: REIL_APP_NAME, path: '/reil' }, ...items];
  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center gap-1.5 text-sm text-text-tertiary ${className}`}
    >
      {segments.map((seg, i) => {
        const isLast = i === segments.length - 1;
        return (
          <React.Fragment key={i}>
            {i > 0 && (
              <ChevronRightIcon size={14} className="text-text-quaternary shrink-0" />
            )}
            {seg.path && !isLast ? (
              <button
                type="button"
                onClick={() => navigate(seg.path!)}
                className="hover:text-text-primary transition-colors truncate"
              >
                {seg.label}
              </button>
            ) : (
              <span className={isLast ? 'text-text-secondary font-medium' : ''}>
                {seg.label}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
