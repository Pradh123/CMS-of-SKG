import { Navigate, Route, Routes } from 'react-router-dom'
import AdminLayout from '../components/layout/AdminLayout.jsx'
import useAuth from '../hooks/useAuth.js'
import Login from '../pages/auth/Login.jsx'
import ForgotPassword from '../pages/auth/ForgotPassword.jsx'
import AreaSEOCreate from '../pages/cms/area-seo/AreaSEOCreate.jsx'
import AreaSEOEdit from '../pages/cms/area-seo/AreaSEOEdit.jsx'
import AreaSEOList from '../pages/cms/area-seo/AreaSEOList.jsx'
import BlogCreate from '../pages/cms/blog/BlogCreate.jsx'
import BlogEdit from '../pages/cms/blog/BlogEdit.jsx'
import BlogList from '../pages/cms/blog/BlogList.jsx'
import PromptCreate from '../pages/cms/chatgpt-prompts/PromptCreate.jsx'
import PromptEdit from '../pages/cms/chatgpt-prompts/PromptEdit.jsx'
import PromptList from '../pages/cms/chatgpt-prompts/PromptList.jsx'
import RouteSEOCreate from '../pages/cms/route-seo/RouteSEOCreate.jsx'
import RouteSEOEdit from '../pages/cms/route-seo/RouteSEOEdit.jsx'
import RouteSEOList from '../pages/cms/route-seo/RouteSEOList.jsx'
import Dashboard from '../pages/dashboard/Dashboard.jsx'
import DriverFormPage from '../pages/drivers/DriverFormPage.jsx'
import DriverListPage from '../pages/drivers/DriverListPage.jsx'
import DriverViewPage from '../pages/drivers/DriverViewPage.jsx'
import FuelFormPage from '../pages/fuel/FuelFormPage.jsx'
import FuelListPage from '../pages/fuel/FuelListPage.jsx'
import InvoiceFormPage from '../pages/invoices/InvoiceFormPage.jsx'
import InvoiceListPage from '../pages/invoices/InvoiceListPage.jsx'
import InvoiceViewPage from '../pages/invoices/InvoiceViewPage.jsx'
import IssueFormPage from '../pages/issues/IssueFormPage.jsx'
import IssueListPage from '../pages/issues/IssueListPage.jsx'
import LeadList from '../pages/leads/LeadList.jsx'
import LeadView from '../pages/leads/LeadView.jsx'
import BranchFormPage from '../pages/masters/BranchFormPage.jsx'
import BranchListPage from '../pages/masters/BranchListPage.jsx'
import CityFormPage from '../pages/masters/CityFormPage.jsx'
import CityListPage from '../pages/masters/CityListPage.jsx'
import InvoiceSettingsPage from '../pages/masters/InvoiceSettingsPage.jsx'
import PartyFormPage from '../pages/parties/PartyFormPage.jsx'
import PartyListPage from '../pages/parties/PartyListPage.jsx'
import ChangePasswordPage from '../pages/profile/ChangePasswordPage.jsx'
import ProfilePage from '../pages/profile/ProfilePage.jsx'
import SettingsPage from '../pages/profile/SettingsPage.jsx'
import PickupDropTripFormPage from '../pages/trips/PickupDropTripFormPage.jsx'
import PickupDropTripListPage from '../pages/trips/PickupDropTripListPage.jsx'
import RegularTripFormPage from '../pages/trips/RegularTripFormPage.jsx'
import RegularTripListPage from '../pages/trips/RegularTripListPage.jsx'
import UserFormPage from '../pages/users/UserFormPage.jsx'
import UsersPage from '../pages/users/UsersPage.jsx'
import PermissionsPage from '../pages/permissions/PermissionsPage.jsx'
import VehicleFormPage from '../pages/vehicles/VehicleFormPage.jsx'
import VehicleListPage from '../pages/vehicles/VehicleListPage.jsx'
import VehicleViewPage from '../pages/vehicles/VehicleViewPage.jsx'
import VendorFormPage from '../pages/vendors/VendorFormPage.jsx'
import VendorListPage from '../pages/vendors/VendorListPage.jsx'

const SUPER_ADMIN_ROUTES = [
  { path: '/users', Component: UsersPage },
  { path: '/users/create', Component: UserFormPage },
  { path: '/users/:id/edit', Component: UserFormPage },
  { path: '/permissions', Component: PermissionsPage },
]

const PANEL_ROUTES = [
  { path: '/leads', access: '/leads', Component: LeadList },
  { path: '/leads/:id', access: '/leads', Component: LeadView },

  { path: '/cms/area-seo', access: '/cms/area-seo', Component: AreaSEOList },
  { path: '/cms/area-seo/create', access: '/cms/area-seo', Component: AreaSEOCreate },
  { path: '/cms/area-seo/:id/edit', access: '/cms/area-seo', Component: AreaSEOEdit },
  { path: '/cms/route-seo', access: '/cms/route-seo', Component: RouteSEOList },
  { path: '/cms/route-seo/create', access: '/cms/route-seo', Component: RouteSEOCreate },
  { path: '/cms/route-seo/:id/edit', access: '/cms/route-seo', Component: RouteSEOEdit },
  { path: '/cms/blog', access: '/cms/blog', Component: BlogList },
  { path: '/cms/blog/create', access: '/cms/blog', Component: BlogCreate },
  { path: '/cms/blog/:id/edit', access: '/cms/blog', Component: BlogEdit },
  {
    path: '/cms/chatgpt-prompts',
    access: '/cms/chatgpt-prompts',
    Component: PromptList,
  },
  {
    path: '/cms/chatgpt-prompts/create',
    access: '/cms/chatgpt-prompts',
    Component: PromptCreate,
  },
  {
    path: '/cms/chatgpt-prompts/:id/edit',
    access: '/cms/chatgpt-prompts',
    Component: PromptEdit,
  },

  { path: '/vehicles', access: '/vehicles', Component: VehicleListPage },
  { path: '/vehicles/create', access: '/vehicles', Component: VehicleFormPage },
  { path: '/vehicles/:id', access: '/vehicles', Component: VehicleViewPage },
  { path: '/vehicles/:id/edit', access: '/vehicles', Component: VehicleFormPage },
  { path: '/drivers', access: '/drivers', Component: DriverListPage },
  { path: '/drivers/create', access: '/drivers', Component: DriverFormPage },
  { path: '/drivers/:id', access: '/drivers', Component: DriverViewPage },
  { path: '/drivers/:id/edit', access: '/drivers', Component: DriverFormPage },
  { path: '/parties', access: '/parties', Component: PartyListPage },
  { path: '/parties/create', access: '/parties', Component: PartyFormPage },
  { path: '/parties/:id/edit', access: '/parties', Component: PartyFormPage },

  { path: '/trips/regular', access: '/trips/regular', Component: RegularTripListPage },
  {
    path: '/trips/regular/create',
    access: '/trips/regular',
    Component: RegularTripFormPage,
  },
  {
    path: '/trips/regular/:id/edit',
    access: '/trips/regular',
    Component: RegularTripFormPage,
  },
  {
    path: '/trips/pickup-drop',
    access: '/trips/pickup-drop',
    Component: PickupDropTripListPage,
  },
  {
    path: '/trips/pickup-drop/create',
    access: '/trips/pickup-drop',
    Component: PickupDropTripFormPage,
  },
  {
    path: '/trips/pickup-drop/:id/edit',
    access: '/trips/pickup-drop',
    Component: PickupDropTripFormPage,
  },

  { path: '/vendors', access: '/vendors', Component: VendorListPage },
  { path: '/vendors/create', access: '/vendors', Component: VendorFormPage },
  { path: '/vendors/:id/edit', access: '/vendors', Component: VendorFormPage },
  { path: '/fuel', access: '/fuel', Component: FuelListPage },
  { path: '/fuel/create', access: '/fuel', Component: FuelFormPage },
  { path: '/fuel/:id/edit', access: '/fuel', Component: FuelFormPage },
  { path: '/issues', access: '/issues', Component: IssueListPage },
  { path: '/issues/create', access: '/issues', Component: IssueFormPage },
  { path: '/issues/:id/edit', access: '/issues', Component: IssueFormPage },
  { path: '/invoices', access: '/invoices', Component: InvoiceListPage },
  { path: '/invoices/create', access: '/invoices', Component: InvoiceFormPage },
  { path: '/invoices/:id', access: '/invoices', Component: InvoiceViewPage },
  { path: '/invoices/:id/edit', access: '/invoices', Component: InvoiceFormPage },

  { path: '/masters/branches', access: '/masters/branches', Component: BranchListPage },
  {
    path: '/masters/branches/create',
    access: '/masters/branches',
    Component: BranchFormPage,
  },
  {
    path: '/masters/branches/:id/edit',
    access: '/masters/branches',
    Component: BranchFormPage,
  },
  { path: '/masters/cities', access: '/masters/cities', Component: CityListPage },
  {
    path: '/masters/cities/create',
    access: '/masters/cities',
    Component: CityFormPage,
  },
  {
    path: '/masters/cities/:id/edit',
    access: '/masters/cities',
    Component: CityFormPage,
  },
  {
    path: '/masters/invoice-settings',
    access: '/masters/invoice-settings',
    Component: InvoiceSettingsPage,
  },
]

export default function AppRoutes() {
  const { user, isSuperAdmin, hasPermission } = useAuth()
  const routeOperation = path => {
    if (path.endsWith('/create')) return 'create'
    if (path.endsWith('/edit')) return 'edit'
    return 'view'
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route element={user ? <AdminLayout /> : <Navigate to="/login" replace />}>
        <Route
          path="/"
          element={
            hasPermission('/', 'view') ? <Dashboard /> : <Navigate to="/no-access" replace />
          }
        />

        {SUPER_ADMIN_ROUTES.map(({ path, Component }) => (
          <Route
            key={path}
            path={path}
            element={isSuperAdmin ? <Component /> : <Navigate to="/no-access" replace />}
          />
        ))}

        {PANEL_ROUTES.map(({ path, access, Component }) => (
          <Route
            key={path}
            path={path}
            element={
              hasPermission(access, routeOperation(path)) ? (
                <Component />
              ) : (
                <Navigate to="/no-access" replace />
              )
            }
          />
        ))}

        <Route
          path="/profile"
          element={isSuperAdmin ? <Navigate to="/users" replace /> : <ProfilePage />}
        />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/change-password" element={<ChangePasswordPage />} />
        <Route
          path="/no-access"
          element={
            <div className="card">
              <h1 className="text-2xl font-bold text-slate-800">Access not granted</h1>
              <p className="mt-2 text-slate-500">
                Ask your Super Admin to enable this panel for your account.
              </p>
            </div>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
