import React from 'react';
import { SettingsIcon } from 'lucide-react';
import { SUITE_NAME } from '../constants/brand';
import { Card } from '../components/ui/Card';

export function Settings() {
  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-h1 text-text-primary mb-6">Settings</h1>
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-lg bg-accent-cyan-dim">
            <SettingsIcon size={20} className="text-accent-cyan" />
          </div>
          <div>
            <p className="font-medium text-text-primary">{SUITE_NAME} Settings</p>
            <p className="text-sm text-text-tertiary">Configure your workspace preferences</p>
          </div>
        </div>
        <p className="text-sm text-text-secondary">
          Settings configuration will be available in a future release.
        </p>
      </Card>
    </div>
  );
}
