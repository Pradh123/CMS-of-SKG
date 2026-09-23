import { useState } from 'react'
import { ChevronRight, Mail, MessageSquareText, Phone, Search, UsersRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import Pagination from '../../components/common/Pagination.jsx'
import { formatLeadDate, leadStatuses, readLeads, setLeadStatus } from './leadUtils.js'
import LeadStatusDropdown from './LeadStatusDropdown.jsx'

const PAGE_SIZE = 10

export default function LeadList() {
  const [leads, setLeads] = useState(readLeads)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('All')
  const [page, setPage] = useState(1)
  const filtered = leads.filter(lead => {
    const matchesQuery = `${lead.name || ''} ${lead.phone || ''} ${lead.email || ''} ${lead.service || ''} ${lead.message || ''}`.toLowerCase().includes(query.trim().toLowerCase())
    return matchesQuery && (filter === 'All' || (lead.status || 'New') === filter)
  })
  const pages = Math.ceil(filtered.length / PAGE_SIZE)
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const changeStatus = (id, status) => setLeads(setLeadStatus(id, status))

  return (
    <div className="leads-page">
      <div className="leads-page-header"><div><h1>Leads</h1><p>Customer enquiries dekhein aur unka follow-up status manage karein.</p></div><div className="lead-summary">{leads.filter(lead => (lead.status || 'New') === 'New').length}<span>New leads</span></div></div>
      <section className="card leads-card">
        <div className="leads-card-header">
          <div className="leads-title"><span><UsersRound size={19} /></span><h2>Customer Leads</h2></div>
          <div className="leads-tools">
            <label className="lead-search"><Search size={16} /><input aria-label="Search leads" placeholder="Name, phone, service..." value={query} onChange={event => { setQuery(event.target.value); setPage(1) }} /></label>
            <select aria-label="Filter lead status" value={filter} onChange={event => { setFilter(event.target.value); setPage(1) }}><option>All</option>{leadStatuses.map(status => <option key={status}>{status}</option>)}</select>
          </div>
        </div>
        <div className="lead-table-wrap">
          <table className="lead-table"><thead><tr><th>Customer</th><th>Contact</th><th>Requirement / Message</th><th>Received</th><th>Status</th><th>View</th></tr></thead>
            <tbody>{visible.map(lead => <tr key={lead.id}>
              <td><strong>{lead.name || 'Unknown customer'}</strong><small>{lead.service || 'General enquiry'}</small></td>
              <td><div className="lead-contact">{lead.phone && <a href={`tel:${lead.phone}`}><Phone size={13} />{lead.phone}</a>}{lead.email && <a href={`mailto:${lead.email}`}><Mail size={13} />{lead.email}</a>}</div></td>
              <td className="lead-message-cell"><span>{lead.message || 'No message provided.'}</span>{(lead.pickup || lead.destination) && <small>{lead.pickup || '—'} → {lead.destination || '—'}</small>}</td>
              <td className="lead-date">{formatLeadDate(lead.createdAt)}</td>
              <td><LeadStatusDropdown value={lead.status || 'New'} onChange={status => changeStatus(lead.id, status)} /></td>
              <td><Link className="lead-view-btn" to={`/leads/${lead.id}`} aria-label={`View ${lead.name || 'lead'}`}><ChevronRight size={18} /></Link></td>
            </tr>)}</tbody>
          </table>
          {!visible.length && <div className="lead-empty"><MessageSquareText size={31} /><h3>{query || filter !== 'All' ? 'No matching leads' : 'No leads received yet'}</h3><p>Website se aane wali customer enquiries yahan dikhengi.</p></div>}
        </div>
        <Pagination page={page} pages={pages} onChange={setPage} />
      </section>
    </div>
  )
}
