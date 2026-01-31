# Q Component Library
**REIL/Q Sprint 0.1 - Lane 3**
**Version:** 1.0
**Last Updated:** 2025-12-31

---

## Overview

This document defines the reusable component library for the Q application. All components follow atomic design principles, are built with React + TypeScript, styled with Tailwind CSS, and animated with Framer Motion.

**Design Principles:**
- **Composable:** Small, single-purpose components that combine into complex UIs
- **Accessible:** WCAG 2.2 AA+ compliant by default
- **Themeable:** CSS variables for easy dark/light mode switching
- **Performant:** Optimized rendering, lazy loading where appropriate
- **Type-Safe:** Full TypeScript coverage with strict mode

---

## Table of Contents

1. [Design Tokens](#design-tokens)
2. [Foundation Components](#foundation-components)
3. [Card Components](#card-components)
4. [Form Components](#form-components)
5. [Data Display](#data-display)
6. [Feedback Components](#feedback-components)
7. [Navigation Components](#navigation-components)
8. [Layout Components](#layout-components)
9. [Animation Utilities](#animation-utilities)
10. [Usage Examples](#usage-examples)

---

## Design Tokens

### CSS Variables

```css
/* d:/SkySlope/REIL-Q/03_UI/styles/tokens.css */

:root {
  /* Brand Colors */
  --color-brand-primary: 37 99 235; /* RGB for Tailwind opacity modifiers */
  --color-brand-secondary: 124 58 237;
  --color-success: 5 150 105;
  --color-warning: 217 119 6;
  --color-error: 220 38 38;
  --color-info: 8 145 178;

  /* Surface Colors (Dark Mode) */
  --color-surface-base: 10 10 10;
  --color-surface-elevated: 26 26 26;
  --color-surface-interactive: 45 45 45;

  /* Text Colors */
  --color-text-primary: 255 255 255;
  --color-text-secondary: 161 161 170;
  --color-text-tertiary: 113 113 122;

  /* Border Colors */
  --color-border-subtle: 255 255 255 / 0.05;
  --color-border-emphasis: 255 255 255 / 0.1;

  /* Spacing Scale (8px base) */
  --space-1: 0.25rem;  /* 4px */
  --space-2: 0.5rem;   /* 8px */
  --space-3: 0.75rem;  /* 12px */
  --space-4: 1rem;     /* 16px */
  --space-5: 1.25rem;  /* 20px */
  --space-6: 1.5rem;   /* 24px */
  --space-8: 2rem;     /* 32px */
  --space-10: 2.5rem;  /* 40px */
  --space-12: 3rem;    /* 48px */
  --space-16: 4rem;    /* 64px */

  /* Border Radius */
  --radius-sm: 0.375rem;  /* 6px */
  --radius-md: 0.5rem;    /* 8px */
  --radius-lg: 0.75rem;   /* 12px */
  --radius-xl: 1rem;      /* 16px */
  --radius-2xl: 1.5rem;   /* 24px */
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.15);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.2);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.3);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.4);
  --shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.5);

  /* Z-Index Scale */
  --z-dropdown: 1000;
  --z-sticky: 1020;
  --z-fixed: 1030;
  --z-modal-backdrop: 1040;
  --z-modal: 1050;
  --z-popover: 1060;
  --z-tooltip: 1070;
}

/* Light Mode Overrides */
[data-theme="light"] {
  --color-surface-base: 255 255 255;
  --color-surface-elevated: 249 250 251;
  --color-surface-interactive: 243 244 246;
  --color-text-primary: 10 10 10;
  --color-text-secondary: 82 82 91;
  --color-text-tertiary: 161 161 170;
  --color-border-subtle: 0 0 0 / 0.05;
  --color-border-emphasis: 0 0 0 / 0.1;
}
```

### Tailwind Configuration

```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: 'rgb(var(--color-brand-primary) / <alpha-value>)',
          secondary: 'rgb(var(--color-brand-secondary) / <alpha-value>)',
        },
        success: 'rgb(var(--color-success) / <alpha-value>)',
        warning: 'rgb(var(--color-warning) / <alpha-value>)',
        error: 'rgb(var(--color-error) / <alpha-value>)',
        info: 'rgb(var(--color-info) / <alpha-value>)',
        surface: {
          base: 'rgb(var(--color-surface-base) / <alpha-value>)',
          elevated: 'rgb(var(--color-surface-elevated) / <alpha-value>)',
          interactive: 'rgb(var(--color-surface-interactive) / <alpha-value>)',
        },
        text: {
          primary: 'rgb(var(--color-text-primary) / <alpha-value>)',
          secondary: 'rgb(var(--color-text-secondary) / <alpha-value>)',
          tertiary: 'rgb(var(--color-text-tertiary) / <alpha-value>)',
        },
        border: {
          subtle: 'var(--color-border-subtle)',
          emphasis: 'var(--color-border-emphasis)',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
        '2xl': 'var(--shadow-2xl)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};
```

---

## Foundation Components

### Button

**Variants:** Primary, Secondary, Ghost, Danger
**Sizes:** SM, MD, LG

```tsx
// src/components/Button/Button.tsx

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Loader2, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  fullWidth?: boolean;
}

const buttonVariants: Record<ButtonVariant, string> = {
  primary: `
    bg-brand-primary text-white
    hover:bg-brand-primary/90
    focus:ring-2 focus:ring-brand-primary focus:ring-offset-2
    focus:ring-offset-surface-base
    disabled:bg-brand-primary/50 disabled:cursor-not-allowed
  `,
  secondary: `
    bg-surface-elevated text-text-primary border border-border-emphasis
    hover:bg-surface-interactive
    focus:ring-2 focus:ring-brand-primary focus:ring-offset-2
    focus:ring-offset-surface-base
    disabled:opacity-50 disabled:cursor-not-allowed
  `,
  ghost: `
    text-text-primary
    hover:bg-surface-interactive
    focus:ring-2 focus:ring-brand-primary focus:ring-offset-2
    focus:ring-offset-surface-base
    disabled:opacity-50 disabled:cursor-not-allowed
  `,
  danger: `
    bg-error text-white
    hover:bg-error/90
    focus:ring-2 focus:ring-error focus:ring-offset-2
    focus:ring-offset-surface-base
    disabled:bg-error/50 disabled:cursor-not-allowed
  `,
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      fullWidth = false,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <motion.button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2',
          'font-semibold rounded-lg',
          'transition-colors duration-200',
          buttonVariants[variant],
          buttonSizes[size],
          fullWidth && 'w-full',
          className
        )}
        whileTap={!disabled && !isLoading ? { scale: 0.97 } : undefined}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : LeftIcon ? (
          <LeftIcon className="w-5 h-5" />
        ) : null}
        {children}
        {!isLoading && RightIcon && <RightIcon className="w-5 h-5" />}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
```

**Usage:**
```tsx
<Button variant="primary" leftIcon={Plus}>New Deal</Button>
<Button variant="secondary" isLoading>Saving...</Button>
<Button variant="ghost" size="sm">Cancel</Button>
```

---

### Badge

**Variants:** Status-based color coding

```tsx
// src/components/Badge/Badge.tsx

import { HTMLAttributes } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  icon?: LucideIcon;
  dot?: boolean;
}

const badgeVariants: Record<BadgeVariant, string> = {
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  error: 'bg-error/10 text-error',
  info: 'bg-info/10 text-info',
  neutral: 'bg-surface-interactive text-text-secondary',
};

export const Badge = ({
  variant = 'neutral',
  icon: Icon,
  dot = false,
  className,
  children,
  ...props
}: BadgeProps) => {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5',
        'px-2.5 py-1 rounded-full',
        'text-xs font-medium uppercase tracking-wide',
        badgeVariants[variant],
        className
      )}
      {...props}
    >
      {dot && (
        <span className={cn('w-1.5 h-1.5 rounded-full', `bg-current`)} />
      )}
      {Icon && <Icon className="w-3.5 h-3.5" />}
      {children}
    </span>
  );
};
```

**Usage:**
```tsx
<Badge variant="success" dot>Closed</Badge>
<Badge variant="warning" icon={Clock}>Pending</Badge>
```

---

### Avatar

**Supports:** Image, initials fallback, status indicator

```tsx
// src/components/Avatar/Avatar.tsx

import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type AvatarStatus = 'online' | 'offline' | 'busy' | 'away';

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  initials?: string;
  size?: AvatarSize;
  status?: AvatarStatus;
}

const sizeClasses: Record<AvatarSize, string> = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl',
};

const statusClasses: Record<AvatarStatus, string> = {
  online: 'bg-success',
  offline: 'bg-text-tertiary',
  busy: 'bg-error',
  away: 'bg-warning',
};

export const Avatar = ({
  src,
  alt = '',
  initials,
  size = 'md',
  status,
  className,
  ...props
}: AvatarProps) => {
  return (
    <div className={cn('relative inline-block', className)} {...props}>
      <div
        className={cn(
          'rounded-full overflow-hidden flex items-center justify-center',
          'bg-brand-primary text-white font-semibold',
          sizeClasses[size]
        )}
      >
        {src ? (
          <img src={src} alt={alt} className="w-full h-full object-cover" />
        ) : (
          <span>{initials || alt.charAt(0).toUpperCase()}</span>
        )}
      </div>

      {status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 w-3 h-3 rounded-full',
            'ring-2 ring-surface-base',
            statusClasses[status]
          )}
        />
      )}
    </div>
  );
};
```

**Usage:**
```tsx
<Avatar src="/user.jpg" alt="John Doe" status="online" />
<Avatar initials="JD" size="lg" />
```

---

## Card Components

### DealCard

**Purpose:** Display deal summary in pipeline/lists

```tsx
// src/components/DealCard/DealCard.tsx

import { motion } from 'framer-motion';
import { User, Calendar, MapPin } from 'lucide-react';
import { Badge } from '../Badge';
import { cn } from '@/lib/utils';

export interface DealCardProps {
  id: string;
  address: string;
  price: number;
  primaryParty: {
    name: string;
    role: string;
  };
  estimatedCloseDate?: Date;
  propertyType: string;
  tags?: Array<{ label: string; variant: 'success' | 'warning' | 'info' }>;
  updatedAt: Date;
  updatedBy: string;
  onClick?: () => void;
  isDragging?: boolean;
}

export const DealCard = ({
  address,
  price,
  primaryParty,
  estimatedCloseDate,
  propertyType,
  tags = [],
  updatedAt,
  updatedBy,
  onClick,
  isDragging = false,
}: DealCardProps) => {
  const formatRelativeTime = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <motion.div
      className={cn(
        'bg-surface-elevated border border-border-emphasis rounded-xl p-4',
        'cursor-grab active:cursor-grabbing',
        'hover:border-brand-primary/30 hover:shadow-lg',
        'transition-all duration-200',
        isDragging && 'rotate-2 scale-105 opacity-80 shadow-2xl'
      )}
      onClick={onClick}
      whileHover={{ y: -2 }}
      layout
    >
      {/* Address */}
      <h3 className="text-lg font-semibold text-text-primary mb-1 truncate">
        {address}
      </h3>

      {/* Price */}
      <p className="text-base font-semibold text-brand-primary mb-3">
        ${price.toLocaleString()}
      </p>

      {/* Primary Party */}
      <div className="flex items-center gap-2 text-sm text-text-secondary mb-2">
        <User className="w-4 h-4 flex-shrink-0" />
        <span className="truncate">
          {primaryParty.name} ({primaryParty.role})
        </span>
      </div>

      {/* Close Date */}
      {estimatedCloseDate && (
        <div className="flex items-center gap-2 text-sm text-text-secondary mb-3">
          <Calendar className="w-4 h-4 flex-shrink-0" />
          <span>Est. Close: {estimatedCloseDate.toLocaleDateString()}</span>
        </div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {tags.slice(0, 2).map((tag, index) => (
            <Badge key={index} variant={tag.variant} className="text-[10px]">
              {tag.label}
            </Badge>
          ))}
          {tags.length > 2 && (
            <Badge variant="neutral" className="text-[10px]">
              +{tags.length - 2} more
            </Badge>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="pt-3 mt-3 border-t border-border-subtle">
        <p className="text-xs text-text-tertiary">
          {formatRelativeTime(updatedAt)} • {updatedBy}
        </p>
      </div>
    </motion.div>
  );
};
```

---

### PropertyCard

**Purpose:** Display property details in search results

```tsx
// src/components/PropertyCard/PropertyCard.tsx

import { motion } from 'framer-motion';
import { Home, Maximize, BedDouble, Bath, MapPin } from 'lucide-react';
import { Badge } from '../Badge';

export interface PropertyCardProps {
  id: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  price: number;
  propertyType: string;
  squareFootage?: number;
  bedrooms?: number;
  bathrooms?: number;
  imageUrl?: string;
  status: 'available' | 'pending' | 'sold';
  onClick?: () => void;
}

export const PropertyCard = ({
  address,
  city,
  state,
  zipCode,
  price,
  propertyType,
  squareFootage,
  bedrooms,
  bathrooms,
  imageUrl,
  status,
  onClick,
}: PropertyCardProps) => {
  const statusVariant = {
    available: 'success' as const,
    pending: 'warning' as const,
    sold: 'neutral' as const,
  };

  return (
    <motion.div
      className="bg-surface-elevated border border-border-emphasis rounded-2xl
                 overflow-hidden hover:border-brand-primary/30 hover:shadow-xl
                 transition-all duration-300 cursor-pointer group"
      onClick={onClick}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Image */}
      <div className="aspect-[16/10] bg-surface-interactive relative overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={address}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Home className="w-12 h-12 text-text-tertiary" />
          </div>
        )}

        {/* Status Badge Overlay */}
        <div className="absolute top-3 right-3">
          <Badge variant={statusVariant[status]}>
            {status.toUpperCase()}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Price */}
        <p className="text-2xl font-bold text-brand-primary mb-2">
          ${price.toLocaleString()}
        </p>

        {/* Address */}
        <h3 className="text-lg font-semibold text-text-primary mb-1">
          {address}
        </h3>
        <p className="text-sm text-text-secondary mb-3 flex items-center gap-1">
          <MapPin className="w-4 h-4" />
          {city}, {state} {zipCode}
        </p>

        {/* Property Details */}
        <div className="flex items-center gap-4 text-sm text-text-secondary">
          {bedrooms && (
            <div className="flex items-center gap-1">
              <BedDouble className="w-4 h-4" />
              <span>{bedrooms} bd</span>
            </div>
          )}
          {bathrooms && (
            <div className="flex items-center gap-1">
              <Bath className="w-4 h-4" />
              <span>{bathrooms} ba</span>
            </div>
          )}
          {squareFootage && (
            <div className="flex items-center gap-1">
              <Maximize className="w-4 h-4" />
              <span>{squareFootage.toLocaleString()} sqft</span>
            </div>
          )}
        </div>

        {/* Property Type */}
        <div className="mt-3 pt-3 border-t border-border-subtle">
          <Badge variant="info" className="text-[10px]">
            {propertyType}
          </Badge>
        </div>
      </div>
    </motion.div>
  );
};
```

---

### ContactCard

**Purpose:** Display contact information in party lists

```tsx
// src/components/ContactCard/ContactCard.tsx

import { Mail, Phone, Building } from 'lucide-react';
import { Avatar } from '../Avatar';
import { Badge } from '../Badge';
import { cn } from '@/lib/utils';

export interface ContactCardProps {
  name: string;
  role: 'buyer' | 'seller' | 'agent' | 'attorney' | 'lender' | 'inspector';
  email?: string;
  phone?: string;
  company?: string;
  avatarUrl?: string;
  onClick?: () => void;
}

const roleColors = {
  buyer: 'success' as const,
  seller: 'info' as const,
  agent: 'warning' as const,
  attorney: 'neutral' as const,
  lender: 'neutral' as const,
  inspector: 'neutral' as const,
};

export const ContactCard = ({
  name,
  role,
  email,
  phone,
  company,
  avatarUrl,
  onClick,
}: ContactCardProps) => {
  return (
    <div
      className={cn(
        'flex items-start gap-4 p-4 rounded-xl',
        'bg-surface-elevated border border-border-emphasis',
        'hover:border-brand-primary/30 hover:shadow-md',
        'transition-all duration-200',
        onClick && 'cursor-pointer'
      )}
      onClick={onClick}
    >
      <Avatar src={avatarUrl} alt={name} initials={name} size="lg" />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="text-base font-semibold text-text-primary truncate">
            {name}
          </h4>
          <Badge variant={roleColors[role]} className="text-[10px] flex-shrink-0">
            {role.toUpperCase()}
          </Badge>
        </div>

        {email && (
          <a
            href={`mailto:${email}`}
            className="flex items-center gap-2 text-sm text-text-secondary
                       hover:text-brand-primary transition-colors mb-1"
            onClick={(e) => e.stopPropagation()}
          >
            <Mail className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{email}</span>
          </a>
        )}

        {phone && (
          <a
            href={`tel:${phone}`}
            className="flex items-center gap-2 text-sm text-text-secondary
                       hover:text-brand-primary transition-colors mb-1"
            onClick={(e) => e.stopPropagation()}
          >
            <Phone className="w-4 h-4 flex-shrink-0" />
            <span>{phone}</span>
          </a>
        )}

        {company && (
          <div className="flex items-center gap-2 text-sm text-text-tertiary">
            <Building className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{company}</span>
          </div>
        )}
      </div>
    </div>
  );
};
```

---

## Form Components

### Input

**Variants:** Text, email, password, number, search

```tsx
// src/components/Input/Input.tsx

import { InputHTMLAttributes, forwardRef } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      fullWidth = true,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full')}>
        {label && (
          <label
            htmlFor={props.id}
            className="text-sm font-medium text-text-primary"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {LeftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">
              <LeftIcon className="w-5 h-5" />
            </div>
          )}

          <input
            ref={ref}
            className={cn(
              'w-full px-4 py-2.5 rounded-lg',
              'bg-surface-interactive text-text-primary',
              'border border-border-emphasis',
              'placeholder:text-text-tertiary',
              'focus:outline-none focus:ring-2 focus:ring-brand-primary',
              'focus:border-transparent',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'transition-all duration-200',
              error && 'border-error focus:ring-error',
              LeftIcon && 'pl-10',
              RightIcon && 'pr-10',
              className
            )}
            {...props}
          />

          {RightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary">
              <RightIcon className="w-5 h-5" />
            </div>
          )}
        </div>

        {(error || helperText) && (
          <p
            className={cn(
              'text-xs',
              error ? 'text-error' : 'text-text-secondary'
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
```

---

### Select

**Purpose:** Dropdown selection with search

```tsx
// src/components/Select/Select.tsx

import { Fragment, useState } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

export interface SelectProps {
  label?: string;
  options: SelectOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  fullWidth?: boolean;
}

export const Select = ({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select option',
  error,
  fullWidth = true,
}: SelectProps) => {
  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full')}>
      {label && (
        <label className="text-sm font-medium text-text-primary">{label}</label>
      )}

      <Listbox value={value} onChange={onChange}>
        <div className="relative">
          <Listbox.Button
            className={cn(
              'relative w-full px-4 py-2.5 rounded-lg',
              'bg-surface-interactive text-text-primary',
              'border border-border-emphasis',
              'text-left cursor-pointer',
              'focus:outline-none focus:ring-2 focus:ring-brand-primary',
              'transition-all duration-200',
              error && 'border-error focus:ring-error'
            )}
          >
            <span className="block truncate">
              {selectedOption ? (
                <span className="flex items-center gap-2">
                  {selectedOption.icon}
                  {selectedOption.label}
                </span>
              ) : (
                <span className="text-text-tertiary">{placeholder}</span>
              )}
            </span>
            <span className="absolute inset-y-0 right-0 flex items-center pr-3">
              <ChevronDown className="w-5 h-5 text-text-tertiary" />
            </span>
          </Listbox.Button>

          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options
              className="absolute z-10 mt-2 w-full py-1 rounded-lg
                         bg-surface-elevated/95 backdrop-blur-xl
                         border border-border-emphasis shadow-xl
                         max-h-60 overflow-auto focus:outline-none"
            >
              {options.map((option) => (
                <Listbox.Option
                  key={option.value}
                  value={option.value}
                  className={({ active }) =>
                    cn(
                      'relative cursor-pointer select-none py-2.5 pl-10 pr-4',
                      active && 'bg-surface-interactive'
                    )
                  }
                >
                  {({ selected }) => (
                    <>
                      <span
                        className={cn(
                          'flex items-center gap-2',
                          selected ? 'font-semibold text-brand-primary' : 'font-normal text-text-primary'
                        )}
                      >
                        {option.icon}
                        {option.label}
                      </span>
                      {selected && (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-brand-primary">
                          <Check className="w-5 h-5" />
                        </span>
                      )}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>

      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
};
```

---

### Textarea

```tsx
// src/components/Textarea/Textarea.tsx

import { TextareaHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, fullWidth = true, className, ...props }, ref) => {
    return (
      <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full')}>
        {label && (
          <label htmlFor={props.id} className="text-sm font-medium text-text-primary">
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          className={cn(
            'w-full px-4 py-2.5 rounded-lg',
            'bg-surface-interactive text-text-primary',
            'border border-border-emphasis',
            'placeholder:text-text-tertiary',
            'focus:outline-none focus:ring-2 focus:ring-brand-primary',
            'focus:border-transparent',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-all duration-200 resize-none',
            error && 'border-error focus:ring-error',
            className
          )}
          {...props}
        />

        {(error || helperText) && (
          <p className={cn('text-xs', error ? 'text-error' : 'text-text-secondary')}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
```

---

## Data Display

### Table

**Features:** Sorting, selection, pagination

```tsx
// src/components/Table/Table.tsx

import { ReactNode } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => ReactNode;
  className?: string;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  selectable?: boolean;
  selectedKeys?: Set<string>;
  onSelectionChange?: (keys: Set<string>) => void;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (column: string) => void;
  emptyState?: ReactNode;
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  selectable = false,
  selectedKeys = new Set(),
  onSelectionChange,
  sortColumn,
  sortDirection,
  onSort,
  emptyState,
}: TableProps<T>) {
  const allSelected = data.length > 0 && data.every((item) => selectedKeys.has(keyExtractor(item)));

  const toggleAll = () => {
    if (allSelected) {
      onSelectionChange?.(new Set());
    } else {
      onSelectionChange?.(new Set(data.map(keyExtractor)));
    }
  };

  const toggleRow = (key: string) => {
    const newSelection = new Set(selectedKeys);
    if (newSelection.has(key)) {
      newSelection.delete(key);
    } else {
      newSelection.add(key);
    }
    onSelectionChange?.(newSelection);
  };

  if (data.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="border-b border-border-emphasis">
          <tr>
            {selectable && (
              <th className="p-4 text-left w-12">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="w-5 h-5 rounded border-2 border-border-emphasis
                             checked:bg-brand-primary checked:border-brand-primary"
                />
              </th>
            )}
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn(
                  'p-4 text-left text-sm font-semibold text-text-primary uppercase tracking-wide',
                  column.sortable && 'cursor-pointer hover:bg-surface-interactive transition-colors',
                  column.className
                )}
                onClick={() => column.sortable && onSort?.(column.key)}
              >
                <div className="flex items-center gap-2">
                  {column.label}
                  {column.sortable && (
                    <span className="text-text-tertiary">
                      {sortColumn === column.key ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp className="w-4 h-4" />
                        ) : (
                          <ArrowDown className="w-4 h-4" />
                        )
                      ) : (
                        <ArrowUpDown className="w-4 h-4" />
                      )}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.map((item) => {
            const key = keyExtractor(item);
            const isSelected = selectedKeys.has(key);

            return (
              <tr
                key={key}
                className={cn(
                  'border-b border-border-subtle',
                  'hover:bg-surface-elevated transition-colors',
                  isSelected && 'bg-brand-primary/5'
                )}
              >
                {selectable && (
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleRow(key)}
                      className="w-5 h-5 rounded border-2 border-border-emphasis
                                 checked:bg-brand-primary checked:border-brand-primary"
                    />
                  </td>
                )}
                {columns.map((column) => (
                  <td key={column.key} className={cn('p-4 text-text-primary', column.className)}>
                    {column.render ? column.render(item) : (item as any)[column.key]}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
```

---

### Timeline

**Purpose:** Activity feed, transaction milestones

```tsx
// src/components/Timeline/Timeline.tsx

import { ReactNode } from 'react';
import { LucideIcon, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TimelineItem {
  id: string;
  timestamp: Date;
  title: string;
  description?: string;
  icon?: LucideIcon;
  status?: 'completed' | 'current' | 'upcoming';
  metadata?: ReactNode;
}

export interface TimelineProps {
  items: TimelineItem[];
  variant?: 'vertical' | 'horizontal';
}

export const Timeline = ({ items, variant = 'vertical' }: TimelineProps) => {
  if (variant === 'horizontal') {
    return (
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-surface-interactive" />

        {/* Milestones */}
        <div className="relative flex justify-between">
          {items.map((item) => {
            const Icon = item.icon || Circle;
            const dotColor = {
              completed: 'bg-success',
              current: 'bg-brand-primary',
              upcoming: 'bg-surface-interactive',
            }[item.status || 'upcoming'];

            return (
              <div key={item.id} className="flex flex-col items-center max-w-[120px]">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center z-10',
                    dotColor,
                    item.status === 'current' && 'ring-4 ring-brand-primary/20'
                  )}
                >
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm text-text-secondary mt-2 text-center">
                  {item.title}
                </span>
                <span className="text-xs text-text-tertiary mt-1">
                  {item.timestamp.toLocaleDateString()}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Vertical variant
  return (
    <div className="space-y-0">
      {items.map((item, index) => {
        const Icon = item.icon || Circle;
        const isLast = index === items.length - 1;
        const dotColor = {
          completed: 'bg-success',
          current: 'bg-brand-primary',
          upcoming: 'bg-surface-interactive',
        }[item.status || 'upcoming'];

        return (
          <div key={item.id} className="flex gap-4 pb-6 relative">
            {/* Timeline line */}
            {!isLast && (
              <div className="absolute left-2 top-8 bottom-0 w-0.5 bg-border-subtle" />
            )}

            {/* Dot */}
            <div
              className={cn(
                'w-4 h-4 rounded-full mt-1 z-10 flex-shrink-0',
                'ring-4 ring-surface-base',
                dotColor
              )}
            />

            {/* Content */}
            <div className="flex-1 pt-0.5">
              <div className="flex items-start justify-between mb-1">
                <h4 className="text-base font-semibold text-text-primary">
                  {item.title}
                </h4>
                <span className="text-sm text-text-tertiary whitespace-nowrap ml-4">
                  {item.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              {item.description && (
                <p className="text-sm text-text-secondary mb-2">{item.description}</p>
              )}
              {item.metadata && <div className="mt-2">{item.metadata}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
};
```

---

## Feedback Components

### EmptyState

```tsx
// src/components/EmptyState/EmptyState.tsx

import { LucideIcon } from 'lucide-react';
import { Button } from '../Button';
import { cn } from '@/lib/utils';

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 px-4 text-center',
        className
      )}
    >
      <div className="w-16 h-16 bg-surface-interactive rounded-2xl flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-text-tertiary" />
      </div>
      <h3 className="text-xl font-semibold text-text-primary mb-2">{title}</h3>
      <p className="text-base text-text-secondary max-w-md mb-6">{description}</p>
      {action && (
        <Button variant="primary" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
};
```

---

### LoadingSpinner

```tsx
// src/components/LoadingSpinner/LoadingSpinner.tsx

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
};

export const LoadingSpinner = ({ size = 'md', className }: LoadingSpinnerProps) => {
  return (
    <motion.div
      className={cn(
        'border-2 border-surface-interactive border-t-brand-primary rounded-full',
        sizeClasses[size],
        className
      )}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    />
  );
};

// Full-page loading overlay
export const LoadingOverlay = () => {
  return (
    <div className="fixed inset-0 bg-surface-base/80 backdrop-blur-sm z-50
                    flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-text-secondary">Loading...</p>
      </div>
    </div>
  );
};
```

---

### Toast/Notification

```tsx
// src/components/Toast/Toast.tsx

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastVariant = 'success' | 'error' | 'info';

export interface ToastProps {
  id: string;
  variant: ToastVariant;
  title: string;
  description?: string;
  duration?: number;
  onClose: () => void;
}

const toastIcons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

const toastColors = {
  success: 'bg-success/10 border-success text-success',
  error: 'bg-error/10 border-error text-error',
  info: 'bg-info/10 border-info text-info',
};

export const Toast = ({ variant, title, description, onClose }: ToastProps) => {
  const Icon = toastIcons[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      className={cn(
        'flex items-start gap-3 p-4 rounded-xl border',
        'bg-surface-elevated/95 backdrop-blur-xl shadow-xl',
        'max-w-sm w-full',
        toastColors[variant]
      )}
    >
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-text-primary mb-1">{title}</h4>
        {description && <p className="text-sm text-text-secondary">{description}</p>}
      </div>
      <button
        onClick={onClose}
        className="text-text-tertiary hover:text-text-primary transition-colors"
      >
        <X className="w-5 h-5" />
      </button>
    </motion.div>
  );
};

// Toast container (fixed position)
export const ToastContainer = ({ toasts }: { toasts: ToastProps[] }) => {
  return (
    <div className="fixed bottom-4 right-4 z-[var(--z-tooltip)] flex flex-col gap-3">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} />
        ))}
      </AnimatePresence>
    </div>
  );
};
```

---

## Animation Utilities

### Motion Presets

```typescript
// src/lib/motion.ts

import { Variants } from 'framer-motion';

export const fadeIn: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
};

export const slideInFromRight: Variants = {
  initial: { opacity: 0, x: 100 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 100 },
};

export const staggerContainer: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24,
    },
  },
};

export const springTap = {
  whileTap: { scale: 0.97 },
  transition: { type: 'spring', stiffness: 400, damping: 17 },
};

export const hoverLift = {
  whileHover: { y: -4, transition: { duration: 0.2 } },
};
```

---

## Usage Examples

### Complete Form Example

```tsx
import { useState } from 'react';
import { Input, Select, Textarea, Button } from '@/components';
import { DollarSign, Home } from 'lucide-react';

export const NewDealForm = () => {
  const [formData, setFormData] = useState({
    address: '',
    price: '',
    propertyType: '',
    notes: '',
  });

  const propertyTypes = [
    { value: 'residential', label: 'Residential', icon: <Home className="w-4 h-4" /> },
    { value: 'commercial', label: 'Commercial' },
    { value: 'land', label: 'Land' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <Input
        label="Property Address"
        placeholder="1234 Oak Street, Austin, TX"
        value={formData.address}
        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        required
      />

      <Input
        label="Price"
        type="number"
        placeholder="450000"
        leftIcon={DollarSign}
        value={formData.price}
        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
        required
      />

      <Select
        label="Property Type"
        options={propertyTypes}
        value={formData.propertyType}
        onChange={(value) => setFormData({ ...formData, propertyType: value })}
      />

      <Textarea
        label="Notes"
        placeholder="Additional details about the deal..."
        rows={4}
        value={formData.notes}
        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
      />

      <div className="flex gap-3">
        <Button type="submit" variant="primary">
          Create Deal
        </Button>
        <Button type="button" variant="secondary">
          Cancel
        </Button>
      </div>
    </form>
  );
};
```

---

## File Structure

```
src/
├── components/
│   ├── Avatar/
│   │   ├── Avatar.tsx
│   │   └── index.ts
│   ├── Badge/
│   │   ├── Badge.tsx
│   │   └── index.ts
│   ├── Button/
│   │   ├── Button.tsx
│   │   └── index.ts
│   ├── DealCard/
│   │   ├── DealCard.tsx
│   │   └── index.ts
│   ├── EmptyState/
│   │   ├── EmptyState.tsx
│   │   └── index.ts
│   ├── Input/
│   │   ├── Input.tsx
│   │   └── index.ts
│   ├── LoadingSpinner/
│   │   ├── LoadingSpinner.tsx
│   │   └── index.ts
│   ├── Select/
│   │   ├── Select.tsx
│   │   └── index.ts
│   ├── Table/
│   │   ├── Table.tsx
│   │   └── index.ts
│   ├── Timeline/
│   │   ├── Timeline.tsx
│   │   └── index.ts
│   ├── Toast/
│   │   ├── Toast.tsx
│   │   ├── ToastProvider.tsx
│   │   └── index.ts
│   └── index.ts (barrel export)
├── lib/
│   ├── motion.ts
│   └── utils.ts
└── styles/
    ├── globals.css
    └── tokens.css
```

---

**Document Version:** 1.0
**Status:** Sprint 0.1 - P0 Deliverable
**Last Updated:** 2025-12-31
