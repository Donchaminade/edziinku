import { lazy } from 'react';
import { Route, Routes } from 'react-router';
import { StaffGate } from './components/layout/AdminLayout';
import { PublicLayout } from './components/layout/PublicLayout';
import { CatalogProvider } from './lib/useCatalog';
import { AuthPage } from './pages/public/AuthPage';
import { CommunesPage } from './pages/public/CommunesPage';
import { CreditsPage, NotFoundPage } from './pages/public/CreditsPage';
import { HomePage } from './pages/public/HomePage';
import { HowPage } from './pages/public/HowPage';
import { MapPage } from './pages/public/MapPage';
import { ProfilePage } from './pages/public/ProfilePage';
import { ReportPage } from './pages/public/ReportPage';
import { WhatsAppPage } from './pages/public/WhatsAppPage';

const AdminMapPage = lazy(() => import('./pages/admin/AdminMapPage').then((module) => ({ default: module.AdminMapPage })));
const AlertsPage = lazy(() => import('./pages/admin/AlertsPage').then((module) => ({ default: module.AlertsPage })));
const BasinsPage = lazy(() => import('./pages/admin/BasinsPage').then((module) => ({ default: module.BasinsPage })));
const HistoryPage = lazy(() => import('./pages/admin/HistoryPage').then((module) => ({ default: module.HistoryPage })));
const ModerationPage = lazy(() => import('./pages/admin/ModerationPage').then((module) => ({ default: module.ModerationPage })));
const OutboxPage = lazy(() => import('./pages/admin/OutboxPage').then((module) => ({ default: module.OutboxPage })));
const OverviewPage = lazy(() => import('./pages/admin/OverviewPage').then((module) => ({ default: module.OverviewPage })));
const TeamsPage = lazy(() => import('./pages/admin/TeamsPage').then((module) => ({ default: module.TeamsPage })));

export default function App() {
  return (
    <CatalogProvider>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="carte" element={<MapPage />} />
          <Route path="signaler" element={<ReportPage />} />
          <Route path="comment" element={<HowPage />} />
          <Route path="communes" element={<CommunesPage />} />
          <Route path="whatsapp" element={<WhatsAppPage />} />
          <Route path="connexion" element={<AuthPage />} />
          <Route path="profil" element={<ProfilePage />} />
          <Route path="credits" element={<CreditsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
        <Route element={<StaffGate />}>
          <Route path="admin" element={<OverviewPage />} />
          <Route path="admin/carte" element={<AdminMapPage />} />
          <Route path="admin/signalements" element={<ModerationPage />} />
          <Route path="admin/alertes" element={<AlertsPage />} />
          <Route path="admin/points-noirs" element={<BasinsPage />} />
          <Route path="admin/historique" element={<HistoryPage />} />
          <Route path="admin/equipes" element={<TeamsPage />} />
          <Route path="admin/whatsapp" element={<OutboxPage />} />
        </Route>
      </Routes>
    </CatalogProvider>
  );
}
