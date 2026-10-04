import {
  AlertTriangle, BarChart3, BookOpenText, BusFront, CalendarDays, CircleDot,
  Fuel, LayoutDashboard, MessageSquareText, NotebookTabs, ReceiptText, Route,
  Settings2, Sparkles, UserRound, UsersRound, Wrench, Building2, MapPinned,
} from 'lucide-react'

export const menu = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Users', path: '/users', icon: UsersRound, superAdminOnly: true },
  { label: 'Leads', path: '/leads', icon: MessageSquareText },
  { label: 'Vehicle', path: '/vehicles', icon: BusFront },
  { label: 'Driver', path: '/drivers', icon: UserRound },
  { label: 'Party', path: '/parties', icon: Building2 },
  { label: 'Trips', icon: Route, children: [
    { label: 'Trips Regular', path: '/trips/regular', icon: CalendarDays },
    { label: 'Trips Pickup/Drop', path: '/trips/pickup-drop', icon: Route },
  ] },
  { label: 'Vendor', path: '/vendors', icon: UsersRound },
  { label: 'Fuel', path: '/fuel', icon: Fuel },
  { label: 'Issues', path: '/issues', icon: AlertTriangle },
  { label: 'Invoice', path: '/invoices', icon: ReceiptText },
  { label: 'Website CMS', icon: Wrench, children: [
    { label: 'Area SEO Pages', path: '/cms/area-seo', icon: MapPinned },
    { label: 'Route SEO Pages', path: '/cms/route-seo', icon: BarChart3 },
    { label: 'Blog Articles', path: '/cms/blog', icon: BookOpenText },
    { label: 'ChatGPT Prompts', path: '/cms/chatgpt-prompts', icon: Sparkles },
  ] },
  { label: 'Masters', icon: CircleDot, children: [
    { label: 'Branch', path: '/masters/branches', icon: Building2 },
    { label: 'Cities', path: '/masters/cities', icon: MapPinned },
    { label: 'Invoice Settings', path: '/masters/invoice-settings', icon: Settings2 },
  ] },
]

export const accessPanels = menu.flatMap(item => item.children || [item])
  .filter(item => !item.superAdminOnly)
  .map(({ label, path }) => ({ id: path, label }))
