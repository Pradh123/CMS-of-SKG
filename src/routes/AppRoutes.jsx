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
export default function AppRoutes() {
  const { user } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route element={user ? <AdminLayout /> : <Navigate to="/login" replace />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/change-password" element={<ChangePasswordPage />} />
        <Route path="/cms/area-seo" element={<AreaSEOList />} />
        <Route path="/cms/area-seo/create" element={<AreaSEOCreate />} />
        <Route path="/cms/area-seo/:id/edit" element={<AreaSEOEdit />} />
        <Route path="/cms/route-seo" element={<RouteSEOList />} />
        <Route path="/cms/route-seo/create" element={<RouteSEOCreate />} />
        <Route path="/cms/route-seo/:id/edit" element={<RouteSEOEdit />} />
        <Route path="/cms/blog" element={<BlogList />} />
        <Route path="/cms/blog/create" element={<BlogCreate />} />
        <Route path="/cms/blog/:id/edit" element={<BlogEdit />} />
        <Route path="/cms/chatgpt-prompts" element={<PromptList />} />
        <Route path="/cms/chatgpt-prompts/create" element={<PromptCreate />} />
        <Route path="/cms/chatgpt-prompts/:id/edit" element={<PromptEdit />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
