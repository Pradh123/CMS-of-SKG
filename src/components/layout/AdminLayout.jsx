import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import Header from './Header.jsx'
export default function AdminLayout() { return <div className="admin-shell"><Sidebar /><div className="admin-main"><Header /><main className="admin-content"><Outlet /></main></div></div> }
