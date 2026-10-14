import { Navigate, Route, Routes } from 'react-router';
import { PublicLayout, StaffGate } from './components/Shell';
import { CatalogProvider } from './lib/useCatalog';
import {
  AdminMapPage,
  AlertsPage,
  BasinsPage,
  HistoryPage,
  ModerationPage,
  OutboxPage,
  OverviewPage,
  TeamsPage,
} from './pages/AdminPages';
import {
  AuthPage,
  CommunesPage,
  HomePage,
  HowPage,
  MapPage,
  ProfilePage,
  ReportPage,
  WhatsAppPage,
} from './pages/PublicPages';

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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </CatalogProvider>
  );
}
