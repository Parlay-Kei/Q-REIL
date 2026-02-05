import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AppShell } from './components/layout/AppShell';
import { Home } from './pages/Home';
import { Dashboard } from './pages/Dashboard';
import { Apps } from './pages/Apps';
import { REILHome } from './pages/REILHome';
import { Inbox } from './pages/Inbox';
import { ThreadDetail } from './pages/ThreadDetail';
import { ItemDetail } from './pages/ItemDetail';
import { Records } from './pages/Records';
import { RecordDetail } from './pages/RecordDetail';
import { DealWorkspace } from './pages/DealWorkspace';
import { Documents } from './pages/Documents';
import { ActivityLedger } from './pages/ActivityLedger';
import { Settings } from './pages/Settings';
import { ToastProvider } from './components/ui/Toast';

function LegacyRedirect({ to, param }: { to: string; param: string }) {
  const params = useParams();
  const value = params[param];
  return <Navigate to={value ? `${to}/${value}` : to} replace />;
}

export function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AppShell />}>
              <Route index element={<Home />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="apps" element={<Apps />} />
              <Route path="reil" element={<REILHome />} />
              <Route path="reil/inbox" element={<Inbox />} />
              <Route path="reil/inbox/item/:rawId" element={<ItemDetail />} />
              <Route path="reil/inbox/:threadId" element={<ThreadDetail />} />
              <Route path="reil/records" element={<Records defaultTab="contacts" />} />
              <Route path="reil/records/:recordId" element={<RecordDetail />} />
              <Route path="reil/deals" element={<Records defaultTab="deals" />} />
              <Route path="reil/deals/:dealId" element={<DealWorkspace />} />
              <Route path="reil/documents" element={<Documents />} />
              <Route path="reil/ledger" element={<ActivityLedger />} />
              <Route path="settings" element={<Settings />} />
              {/* Legacy redirects */}
              <Route path="inbox" element={<Navigate to="/reil/inbox" replace />} />
              <Route path="inbox/:threadId" element={<LegacyRedirect to="/reil/inbox" param="threadId" />} />
              <Route path="records" element={<Navigate to="/reil/records" replace />} />
              <Route path="deals" element={<Navigate to="/reil/deals" replace />} />
              <Route path="deals/:dealId" element={<LegacyRedirect to="/reil/deals" param="dealId" />} />
              <Route path="documents" element={<Navigate to="/reil/documents" replace />} />
              <Route path="ledger" element={<Navigate to="/reil/ledger" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </ErrorBoundary>
  );
}
