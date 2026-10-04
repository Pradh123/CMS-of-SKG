import { useLocation } from 'react-router-dom'
import { menu } from '../config/menu.js'
import PageHeader from '../components/layout/PageHeader.jsx'

const panelDescriptions = {
  Users: 'Create admin accounts and assign access to each panel.',
  Vehicle: 'Manage fleet vehicles, registration details, and availability.',
  Driver: 'Maintain driver profiles, contact information, and assignments.',
  Party: 'Manage customer and business party records.',
  'Trips Regular': 'Plan and review regular trips.',
  'Trips Pickup/Drop': 'Plan and review pickup and drop trips.',
  Vendor: 'Maintain vendor contacts and service records.',
  Fuel: 'Review fuel entries and fleet fuel activity.',
  Issues: 'Track fleet and trip issues through resolution.',
  Invoice: 'Prepare and manage customer invoices.',
  Branch: 'Configure business branches.',
  Cities: 'Maintain cities available across the system.',
  'Invoice Settings': 'Set the defaults used by invoice documents.',
}

export default function PlaceholderPanel() {
  const { pathname } = useLocation()
  const panel = menu.flatMap(item => item.children || [item]).find(item => item.path === pathname)
  const title = panel?.label || 'Admin panel'
  return (
    <div>
      <PageHeader
        title={title}
        description={panelDescriptions[title] || 'Manage this section of the admin workspace.'}
      />
      <section className="card" style={{ borderTop: '4px solid #1671b9' }}>
        <h2 className="text-lg font-semibold text-slate-800">{title} workspace</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          This section is included in the admin navigation and panel access controls. Its record
          management workflow can be added here.
        </p>
      </section>
    </div>
  )
}
