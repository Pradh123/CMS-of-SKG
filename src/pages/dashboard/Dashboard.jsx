import { Link } from 'react-router-dom'
import PageHeader from '../../components/layout/PageHeader.jsx'
import { menu } from '../../config/menu.js'
import { readRecords } from '../../data/store.js'
export default function Dashboard() { return <><PageHeader title="Dashboard" description="Manage your website content in one place." /><div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">{menu.slice(1).map(item => <Link key={item.path} to={item.path} className="card hover:border-blue-400"><h2 className="font-semibold">{item.label}</h2><p className="text-3xl font-bold mt-4">{readRecords(item.path.split('/').at(-1)).length}</p><p className="text-slate-500 text-sm mt-2">View records →</p></Link>)}</div></> }
