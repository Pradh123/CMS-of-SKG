import { readRecords, writeRecords } from '../../data/store.js'

export const leadStatuses = ['New', 'Not Contacted', 'Contacted', 'Success']

const defaultLeads = [
  {
    id: 'demo-lead-1',
    name: 'Rahul Sharma',
    phone: '+91 98765 43210',
    email: 'rahul.sharma@example.com',
    service: 'Airport Taxi',
    pickup: 'Andheri East, Mumbai',
    destination: 'Mumbai Airport T2',
    travelDate: '2026-09-23T04:30:00.000Z',
    message: 'Mujhe 23 September ko subah 10 baje Andheri East se Mumbai Airport T2 ke liye cab chahiye. 3 passengers hain aur 2 bade bags hain. Sedan ka rate share kar dijiye.',
    status: 'New',
    createdAt: '2026-09-21T06:15:00.000Z',
  },
  {
    id: 'demo-lead-2',
    name: 'Priya Mehta',
    phone: '+91 98204 11882',
    email: 'priya.mehta@example.com',
    service: 'Outstation Cab',
    pickup: 'Bandra West, Mumbai',
    destination: 'Lonavala',
    travelDate: '2026-09-27T00:30:00.000Z',
    message: 'We need a round-trip cab from Bandra to Lonavala for 4 adults. Departure Sunday morning and return the same evening. Please send SUV and sedan pricing.',
    status: 'Contacted',
    createdAt: '2026-09-20T12:40:00.000Z',
  },
  {
    id: 'demo-lead-3',
    name: 'Amit Verma',
    phone: '+91 98921 77540',
    email: 'amit.verma@example.com',
    service: 'Tempo Traveller',
    pickup: 'Thane West',
    destination: 'Shirdi',
    travelDate: '2026-10-02T20:30:00.000Z',
    message: 'Family trip ke liye 17 seater tempo traveller chahiye. Total 14 log hain. Thane se Shirdi jaana hai aur next day return karna hai. AC vehicle hona chahiye.',
    status: 'Success',
    createdAt: '2026-09-19T08:20:00.000Z',
  },
  {
    id: 'demo-lead-4',
    name: 'Neha Kapoor',
    phone: '+91 97690 22134',
    email: 'neha.kapoor@example.com',
    service: 'Corporate Car Rental',
    pickup: 'Powai, Mumbai',
    destination: 'BKC, Mumbai',
    travelDate: '2026-09-24T02:30:00.000Z',
    message: 'Our company requires a premium car with driver for a client meeting. Pickup from Powai, multiple stops in BKC, and drop back by 7 PM. Please share the full-day package.',
    status: 'New',
    createdAt: '2026-09-21T04:05:00.000Z',
  },
  {
    id: 'demo-lead-5',
    name: 'Suresh Patil',
    phone: '+91 99308 64019',
    email: 'suresh.patil@example.com',
    service: 'Local Sightseeing',
    pickup: 'Dadar, Mumbai',
    destination: 'Mumbai Darshan',
    travelDate: '2026-09-26T01:30:00.000Z',
    message: '6 family members ke liye Mumbai Darshan package chahiye. Gateway, Marine Drive, Siddhivinayak aur Juhu cover karna hai. Innova available hai kya?',
    status: 'Contacted',
    createdAt: '2026-09-18T10:55:00.000Z',
  },
  {
    id: 'demo-lead-6',
    name: 'Farhan Khan',
    phone: '+91 98191 33672',
    email: 'farhan.khan@example.com',
    service: 'One Way Cab',
    pickup: 'Navi Mumbai',
    destination: 'Pune',
    travelDate: '2026-09-22T23:30:00.000Z',
    message: 'Need a one-way cab from Vashi to Pune tomorrow morning for two people. Please confirm the final price including tolls and driver charges.',
    status: 'New',
    createdAt: '2026-09-21T09:10:00.000Z',
  },
]

export const readLeads = () => {
  const savedLeads = readRecords('leads')
  return savedLeads.length ? savedLeads : defaultLeads
}
export const saveLeads = leads => writeRecords('leads', leads)
export const setLeadStatus = (id, status) => {
  const leads = readLeads()
  const next = leads.map(lead => lead.id === id ? { ...lead, status, statusUpdatedAt: new Date().toISOString() } : lead)
  saveLeads(next)
  return next
}

export function formatLeadDate(value, withTime = false) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  }).format(new Date(value))
}
