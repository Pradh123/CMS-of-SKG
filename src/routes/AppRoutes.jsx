import { Navigate, Route, Routes } from 'react-router-dom'
import AdminLayout from '../components/layout/AdminLayout.jsx'
import Login from '../pages/auth/Login.jsx'
import ForgotPassword from '../pages/auth/ForgotPassword.jsx'
import Dashboard from '../pages/dashboard/Dashboard.jsx'
import useAuth from '../hooks/useAuth.js'
import AreaSEOList from '../pages/cms/area-seo/AreaSEOList.jsx'
import AreaSEOCreate from '../pages/cms/area-seo/AreaSEOCreate.jsx'
import AreaSEOEdit from '../pages/cms/area-seo/AreaSEOEdit.jsx'
import RouteSEOList from '../pages/cms/route-seo/RouteSEOList.jsx'
import RouteSEOCreate from '../pages/cms/route-seo/RouteSEOCreate.jsx'
import RouteSEOEdit from '../pages/cms/route-seo/RouteSEOEdit.jsx'
import BlogList from '../pages/cms/blog/BlogList.jsx'
import BlogCreate from '../pages/cms/blog/BlogCreate.jsx'
import BlogEdit from '../pages/cms/blog/BlogEdit.jsx'
import PromptList from '../pages/cms/chatgpt-prompts/PromptList.jsx'
import PromptCreate from '../pages/cms/chatgpt-prompts/PromptCreate.jsx'
import PromptEdit from '../pages/cms/chatgpt-prompts/PromptEdit.jsx'
import ProfilePage from '../pages/profile/ProfilePage.jsx'
import SettingsPage from '../pages/profile/SettingsPage.jsx'
import ChangePasswordPage from '../pages/profile/ChangePasswordPage.jsx'
import LeadList from '../pages/leads/LeadList.jsx'
import LeadView from '../pages/leads/LeadView.jsx'
import UsersPage from '../pages/users/UsersPage.jsx'
import UserFormPage from '../pages/users/UserFormPage.jsx'
import PlaceholderPanel from '../pages/PlaceholderPanel.jsx'
export default function AppRoutes() {
  const { user, isSuperAdmin, userAccess } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route element={user ? <AdminLayout /> : <Navigate to="/login" replace />}>
        <Route path="/" element={isSuperAdmin || userAccess.includes('/') ? <Dashboard /> : <Navigate to="/no-access" replace />} />
        <Route path="/users" element={isSuperAdmin ? <UsersPage /> : <Navigate to="/no-access" replace />} />
        <Route path="/users/create" element={isSuperAdmin ? <UserFormPage /> : <Navigate to="/no-access" replace />} />
        <Route path="/users/:id/edit" element={isSuperAdmin ? <UserFormPage /> : <Navigate to="/no-access" replace />} />
        <Route path="/no-access" element={<div className="card"><h1 className="text-2xl font-bold text-slate-800">Access not granted</h1><p className="mt-2 text-slate-500">Ask your Super Admin to enable this panel for your account.</p></div>} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/change-password" element={<ChangePasswordPage />} />
        <Route path="/leads" element={isSuperAdmin || userAccess.includes('/leads') ? <LeadList /> : <Navigate to="/no-access" replace />} />
        <Route path="/leads/:id" element={isSuperAdmin || userAccess.includes('/leads') ? <LeadView /> : <Navigate to="/no-access" replace />} />
        <Route path="/cms/area-seo" element={isSuperAdmin || userAccess.includes('/cms/area-seo') ? <AreaSEOList /> : <Navigate to="/no-access" replace />} />
        <Route path="/cms/area-seo/create" element={isSuperAdmin || userAccess.includes('/cms/area-seo') ? <AreaSEOCreate /> : <Navigate to="/no-access" replace />} />
        <Route path="/cms/area-seo/:id/edit" element={isSuperAdmin || userAccess.includes('/cms/area-seo') ? <AreaSEOEdit /> : <Navigate to="/no-access" replace />} />
        <Route path="/cms/route-seo" element={isSuperAdmin || userAccess.includes('/cms/route-seo') ? <RouteSEOList /> : <Navigate to="/no-access" replace />} />
        <Route path="/cms/route-seo/create" element={isSuperAdmin || userAccess.includes('/cms/route-seo') ? <RouteSEOCreate /> : <Navigate to="/no-access" replace />} />
        <Route path="/cms/route-seo/:id/edit" element={isSuperAdmin || userAccess.includes('/cms/route-seo') ? <RouteSEOEdit /> : <Navigate to="/no-access" replace />} />
        <Route path="/cms/blog" element={isSuperAdmin || userAccess.includes('/cms/blog') ? <BlogList /> : <Navigate to="/no-access" replace />} />
        <Route path="/cms/blog/create" element={isSuperAdmin || userAccess.includes('/cms/blog') ? <BlogCreate /> : <Navigate to="/no-access" replace />} />
        <Route path="/cms/blog/:id/edit" element={isSuperAdmin || userAccess.includes('/cms/blog') ? <BlogEdit /> : <Navigate to="/no-access" replace />} />
        <Route path="/cms/chatgpt-prompts" element={isSuperAdmin || userAccess.includes('/cms/chatgpt-prompts') ? <PromptList /> : <Navigate to="/no-access" replace />} />
        <Route path="/cms/chatgpt-prompts/create" element={isSuperAdmin || userAccess.includes('/cms/chatgpt-prompts') ? <PromptCreate /> : <Navigate to="/no-access" replace />} />
        <Route path="/cms/chatgpt-prompts/:id/edit" element={isSuperAdmin || userAccess.includes('/cms/chatgpt-prompts') ? <PromptEdit /> : <Navigate to="/no-access" replace />} />
        <Route path="/vehicles" element={isSuperAdmin || userAccess.includes('/vehicles') ? <PlaceholderPanel /> : <Navigate to="/no-access" replace />} />
        <Route path="/drivers" element={isSuperAdmin || userAccess.includes('/drivers') ? <PlaceholderPanel /> : <Navigate to="/no-access" replace />} />
        <Route path="/parties" element={isSuperAdmin || userAccess.includes('/parties') ? <PlaceholderPanel /> : <Navigate to="/no-access" replace />} />
        <Route path="/trips/regular" element={isSuperAdmin || userAccess.includes('/trips/regular') ? <PlaceholderPanel /> : <Navigate to="/no-access" replace />} />
        <Route path="/trips/pickup-drop" element={isSuperAdmin || userAccess.includes('/trips/pickup-drop') ? <PlaceholderPanel /> : <Navigate to="/no-access" replace />} />
        <Route path="/vendors" element={isSuperAdmin || userAccess.includes('/vendors') ? <PlaceholderPanel /> : <Navigate to="/no-access" replace />} />
        <Route path="/fuel" element={isSuperAdmin || userAccess.includes('/fuel') ? <PlaceholderPanel /> : <Navigate to="/no-access" replace />} />
        <Route path="/issues" element={isSuperAdmin || userAccess.includes('/issues') ? <PlaceholderPanel /> : <Navigate to="/no-access" replace />} />
        <Route path="/invoices" element={isSuperAdmin || userAccess.includes('/invoices') ? <PlaceholderPanel /> : <Navigate to="/no-access" replace />} />
        <Route path="/masters/branches" element={isSuperAdmin || userAccess.includes('/masters/branches') ? <PlaceholderPanel /> : <Navigate to="/no-access" replace />} />
        <Route path="/masters/cities" element={isSuperAdmin || userAccess.includes('/masters/cities') ? <PlaceholderPanel /> : <Navigate to="/no-access" replace />} />
        <Route path="/masters/invoice-settings" element={isSuperAdmin || userAccess.includes('/masters/invoice-settings') ? <PlaceholderPanel /> : <Navigate to="/no-access" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
