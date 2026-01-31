import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SUITE_NAME } from '../constants/brand';
import { AppSwitcher } from '../components/layout/AppSwitcher';

export function Apps() {
  const navigate = useNavigate();
  return (
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary tracking-tight mb-2">
          Apps
        </h1>
        <p className="text-text-secondary">
          Access all {SUITE_NAME} modules. Each app connects to your unified ledger.
        </p>
      </div>

      {/* App Grid */}
      <AppSwitcher onNavigate={navigate} />
    </div>
  );
}