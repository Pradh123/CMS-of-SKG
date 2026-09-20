import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import PageHeader from '../../components/layout/PageHeader.jsx'
import SearchBox from '../../components/common/SearchBox.jsx'
import EmptyState from '../../components/common/EmptyState.jsx'
import Pagination from '../../components/common/Pagination.jsx'
import StatusBadge from '../../components/common/StatusBadge.jsx'
import { readRecords, writeRecords } from '../../data/store.js'
import formatDate from '../../utils/formatDate.js'
export default function CmsList({ title, storageKey }) {
  const location = useLocation(); const [records, setRecords] = useState(() => readRecords(storageKey)); const [query, setQuery] = useState(''); const [page, setPage] = useState(1)
  useEffect(() => { setRecords(readRecords(storageKey)); setPage(1) }, [storageKey])
  const filtered = records.filter(record => `${record.title} ${record.slug}`.toLowerCase().includes(query.toLowerCase()))
  const pages = Math.ceil(filtered.length / 8); const visible = filtered.slice((page - 1) * 8, page * 8)
  function remove(id) { if (!window.confirm('Delete this record?')) return; const next = records.filter(record => record.id !== id); writeRecords(storageKey, next); setRecords(next) }
  return <><PageHeader title={title} description="Create and manage your content." action={<Link className="btn" to={`${location.pathname}/create`}>Create new</Link>} /><div className="card"><SearchBox value={query} onChange={event => { setQuery(event.target.value); setPage(1) }} /><div className="overflow-x-auto mt-5">{visible.length ? <table className="w-full text-left"><thead><tr className="border-b text-slate-500 text-sm"><th className="py-3">Title</th><th>Status</th><th>Updated</th><th>Actions</th></tr></thead><tbody>{visible.map(record => <tr key={record.id} className="border-b last:border-0"><td className="py-4 font-medium">{record.title}</td><td><StatusBadge status={record.status} /></td><td>{formatDate(record.updatedAt)}</td><td className="whitespace-nowrap"><Link className="text-blue-700 mr-4" to={`${location.pathname}/${record.id}/edit`}>Edit</Link><button className="text-red-600 cursor-pointer" onClick={() => remove(record.id)}>Delete</button></td></tr>)}</tbody></table> : <EmptyState />}</div><Pagination page={page} pages={pages} onChange={setPage} /></div></>
}
