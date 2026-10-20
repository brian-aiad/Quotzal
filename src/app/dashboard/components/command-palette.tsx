'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import { toast } from 'sonner';
import {
  Home,
  Inbox,
  Link2,
  CalendarDays,
  Settings,
  CreditCard,
  Copy,
  Download,
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: Home, shortcut: '' },
  { label: 'Submissions', href: '/dashboard/submissions', icon: Inbox, shortcut: '' },
  { label: 'Renewals', href: '/dashboard/renewals', icon: CalendarDays, shortcut: '' },
  { label: 'My Form', href: '/dashboard/form', icon: Link2, shortcut: '' },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings, shortcut: '' },
  { label: 'Billing', href: '/dashboard/billing', icon: CreditCard, shortcut: '' },
];

export function CommandPalette({ formSlug }: { formSlug: string }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  function handleNavigate(href: string) {
    setOpen(false);
    router.push(href);
  }

  function handleCopyFormLink() {
    const url = `${window.location.origin}/f/${encodeURIComponent(formSlug)}`;
    navigator.clipboard.writeText(url).then(() => {
      toast.success('Form link copied to clipboard');
    });
    setOpen(false);
  }

  function handleExportCSV() {
    window.open('/api/dashboard/submissions/export', '_blank');
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/50"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <Command
          className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200"
          onKeyDown={(e: React.KeyboardEvent) => {
            if (e.key === 'Escape') {
              setOpen(false);
            }
          }}
        >
          <Command.Input
            placeholder="Type a command or search..."
            className="w-full px-4 py-3.5 text-sm text-gray-900 placeholder-gray-400 border-b border-gray-100 outline-none bg-transparent"
            autoFocus
          />

          <Command.List className="max-h-72 overflow-y-auto p-2">
            <Command.Empty className="px-4 py-8 text-sm text-center text-gray-500">
              No results found.
            </Command.Empty>

            <Command.Group
              heading="Navigation"
              className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-gray-400 [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider"
            >
              {NAV_ITEMS.map((item) => (
                <Command.Item
                  key={item.href}
                  value={item.label}
                  onSelect={() => handleNavigate(item.href)}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 rounded-lg cursor-pointer data-[selected=true]:bg-gray-100 data-[selected=true]:text-gray-900"
                >
                  <item.icon className="w-4 h-4 text-gray-400" />
                  <span className="flex-1">{item.label}</span>
                </Command.Item>
              ))}
            </Command.Group>

            <Command.Separator className="my-1.5 h-px bg-gray-100" />

            <Command.Group
              heading="Quick Actions"
              className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-gray-400 [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider"
            >
              <Command.Item
                value="Copy form link"
                onSelect={handleCopyFormLink}
                className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 rounded-lg cursor-pointer data-[selected=true]:bg-gray-100 data-[selected=true]:text-gray-900"
              >
                <Copy className="w-4 h-4 text-gray-400" />
                <span className="flex-1">Copy form link</span>
              </Command.Item>
              <Command.Item
                value="Export CSV"
                onSelect={handleExportCSV}
                className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 rounded-lg cursor-pointer data-[selected=true]:bg-gray-100 data-[selected=true]:text-gray-900"
              >
                <Download className="w-4 h-4 text-gray-400" />
                <span className="flex-1">Export CSV</span>
              </Command.Item>
            </Command.Group>
          </Command.List>

          <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded text-[10px] font-medium text-gray-500">↑↓</kbd>
                navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded text-[10px] font-medium text-gray-500">↵</kbd>
                select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded text-[10px] font-medium text-gray-500">esc</kbd>
                close
              </span>
            </div>
          </div>
        </Command>
      </div>
    </div>
  );
}
