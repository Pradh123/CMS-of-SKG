import { ArrowLeft, CalendarDays, CheckCircle2, Clock3, Mail, MapPin, MessageSquareText, Phone, UserRound } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { formatLeadDate, leadStatuses, readLeads, setLeadStatus } from './leadUtils.js'
import { statusClass } from './LeadStatusDropdown.jsx'

function Detail({ icon: Icon, label, children }) {
  return <div className="lead-detail"><span className="lead-detail-icon"><Icon size={17} /></span><div><small>{label}</small><div>{children || '—'}</div></div></div>
}

export default function LeadView() {
  const { id } = useParams()
  const [lead, setLead] = useState(() => readLeads().find(item => item.id === id))
  if (!lead) return <div className="card lead-not-found"><h2>Lead not found</h2><Link to="/leads">Back to leads</Link></div>
  const changeStatus = status => {
    setLeadStatus(id, status)
    setLead(current => ({ ...current, status, statusUpdatedAt: new Date().toISOString() }))
  }
  const phoneDigits = (lead.phone || '').replace(/[^0-9]/g, '')
  return <div className="lead-view-page">
    <Link className="lead-back" to="/leads"><ArrowLeft size={17} /> Back to leads</Link>
    <div className="lead-view-header"><div><span className="lead-avatar"><UserRound size={25} /></span><div><h1>{lead.name || 'Unknown customer'}</h1><p>Lead received {formatLeadDate(lead.createdAt, true)}</p></div></div><span className={`lead-view-status ${statusClass(lead.status || 'New')}`}>{lead.status || 'New'}</span></div>
    <div className="lead-view-grid">
      <section className="card lead-main-card">
        <h2><MessageSquareText size={19} /> Customer Message</h2>
        <div className="lead-full-message">{lead.message || 'Customer ne koi message nahi diya.'}</div>
        <h2 className="details-heading">Lead Details</h2>
        <div className="lead-details-grid">
          <Detail icon={Phone} label="Phone">{lead.phone && <a href={`tel:${lead.phone}`}>{lead.phone}</a>}</Detail>
          <Detail icon={Mail} label="Email">{lead.email && <a href={`mailto:${lead.email}`}>{lead.email}</a>}</Detail>
          <Detail icon={MapPin} label="Pickup">{lead.pickup}</Detail>
          <Detail icon={MapPin} label="Destination">{lead.destination}</Detail>
          <Detail icon={CalendarDays} label="Travel date">{formatLeadDate(lead.travelDate)}</Detail>
          <Detail icon={Clock3} label="Received">{formatLeadDate(lead.createdAt, true)}</Detail>
        </div>
      </section>
      <aside className="card lead-action-card"><h2>Update Lead Status</h2><p>Customer conversation ke according status mark karein.</p><div className="lead-status-actions">{leadStatuses.map(status => <button type="button" key={status} className={`lead-status-action ${status === (lead.status || 'New') ? 'selected' : ''} ${statusClass(status)}`} onClick={() => changeStatus(status)}><CheckCircle2 size={18} /><span><strong>{status}</strong><small>{status === 'New' ? 'Follow-up pending' : status === 'Not Contacted' ? 'Customer se contact nahi hua' : status === 'Contacted' ? 'Customer se baat ho gayi' : 'Lead successfully converted'}</small></span></button>)}</div><div className="lead-contact-actions">{lead.phone && <a className="btn" href={`tel:${lead.phone}`}><Phone size={16} /> Call</a>}{phoneDigits && <a className="btn whatsapp-btn" href={`https://wa.me/${phoneDigits}`} target="_blank" rel="noreferrer">WhatsApp</a>}{lead.email && <a className="btn btn-secondary" href={`mailto:${lead.email}`}><Mail size={16} /> Email</a>}</div></aside>
    </div>
  </div>
}
