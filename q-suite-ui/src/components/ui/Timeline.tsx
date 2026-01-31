import React from 'react';
import {
  FileTextIcon,
  MailIcon,
  LinkIcon,
  UserIcon,
  BriefcaseIcon,
  ClockIcon } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
interface TimelineEvent {
  id: string;
  type: 'document' | 'email' | 'link' | 'user' | 'deal' | 'system';
  title: string;
  description?: string;
  actor?: string;
  timestamp: string;
  references?: string[];
  metadata?: Record<string, string | number | undefined>;
}
interface TimelineProps {
  events: TimelineEvent[];
  groupByDay?: boolean;
  className?: string;
}
const eventIcons: Record<TimelineEvent['type'], LucideIcon> = {
  document: FileTextIcon,
  email: MailIcon,
  link: LinkIcon,
  user: UserIcon,
  deal: BriefcaseIcon,
  system: ClockIcon
};
const eventColors: Record<TimelineEvent['type'], string> = {
  document: 'text-accent-violet bg-accent-violet-dim',
  email: 'text-accent-cyan bg-accent-cyan-dim',
  link: 'text-accent-teal bg-accent-teal-dim',
  user: 'text-success bg-success-dim',
  deal: 'text-warning bg-warning-dim',
  system: 'text-text-tertiary bg-surface-elevated'
};
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    });
  }
}
function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}
function groupEventsByDay(
events: TimelineEvent[])
: Map<string, TimelineEvent[]> {
  const groups = new Map<string, TimelineEvent[]>();
  events.forEach((event) => {
    const dateKey = new Date(event.timestamp).toDateString();
    if (!groups.has(dateKey)) {
      groups.set(dateKey, []);
    }
    groups.get(dateKey)!.push(event);
  });
  return groups;
}
export function Timeline({
  events,
  groupByDay = true,
  className = ''
}: TimelineProps) {
  if (groupByDay) {
    const groupedEvents = groupEventsByDay(events);
    return (
      <div className={`space-y-6 ${className}`}>
        {Array.from(groupedEvents.entries()).map(([dateKey, dayEvents]) =>
        <div key={dateKey}>
            {/* Day header */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm font-medium text-text-secondary">
                {formatDate(dayEvents[0].timestamp)}
              </span>
              <div className="flex-1 h-px bg-stroke-hairline" />
            </div>

            {/* Events for this day */}
            <div className="relative pl-8">
              {/* Vertical line with aurora glow */}
              <div className="absolute left-3 top-2 bottom-2 w-px bg-gradient-to-b from-accent-cyan/40 via-accent-violet/40 to-accent-teal/40" />

              <div className="space-y-4">
                {dayEvents.map((event, index) =>
              <TimelineItem
                key={event.id}
                event={event}
                isLast={index === dayEvents.length - 1} />

              )}
              </div>
            </div>
          </div>
        )}
      </div>);

  }
  return (
    <div className={`relative pl-8 ${className}`}>
      <div className="absolute left-3 top-2 bottom-2 w-px bg-gradient-to-b from-accent-cyan/40 via-accent-violet/40 to-accent-teal/40" />
      <div className="space-y-4">
        {events.map((event, index) =>
        <TimelineItem
          key={event.id}
          event={event}
          isLast={index === events.length - 1} />

        )}
      </div>
    </div>);

}
function TimelineItem({
  event,
  isLast



}: {event: TimelineEvent;isLast: boolean;}) {
  const Icon = eventIcons[event.type];
  const colorClass = eventColors[event.type];
  return (
    <div className="relative flex gap-4 group">
      {/* Icon node */}
      <div
        className={`
          absolute -left-8 w-6 h-6 rounded-full flex items-center justify-center
          ${colorClass}
          ring-4 ring-bg-deep
          transition-transform duration-base
          group-hover:scale-110
        `}>

        <Icon size={12} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium text-text-primary truncate">
              {event.title}
            </p>
            {event.description &&
            <p className="text-sm text-text-tertiary mt-0.5 line-clamp-2">
                {event.description}
              </p>
            }
          </div>
          <span className="text-xs text-text-quaternary font-mono whitespace-nowrap">
            {formatTime(event.timestamp)}
          </span>
        </div>

        {/* Actor and references */}
        <div className="flex items-center gap-3 mt-2 flex-wrap">
          {event.actor &&
          <span className="text-xs text-text-tertiary">by {event.actor}</span>
          }
          {event.references && event.references.length > 0 &&
          <div className="flex items-center gap-1.5">
              {event.references.map((ref, i) =>
            <span
              key={i}
              className="text-xs font-mono px-1.5 py-0.5 rounded bg-surface-elevated text-text-tertiary">

                  {ref}
                </span>
            )}
            </div>
          }
        </div>

        {/* Metadata */}
        {event.metadata && Object.keys(event.metadata).length > 0 &&
        <div className="flex items-center gap-3 mt-2">
            {Object.entries(event.metadata).map(([key, value]) =>
          <span key={key} className="text-xs text-text-quaternary">
                {key}: <span className="text-text-tertiary">{value}</span>
              </span>
          )}
          </div>
        }
      </div>
    </div>);

}