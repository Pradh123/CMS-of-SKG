import { NavLink } from 'react-router-dom'
import { menu } from '../../config/menu.js'
export default function Sidebar() { return <aside className="sidebar"><div className="flex items-center gap-3 px-3 mb-8"><img src="/logo/skg-logo.png" alt="SKG" className="w-12 h-12 object-contain bg-white rounded-lg" /><strong>SKG Admin</strong></div><nav>{menu.map(item => <NavLink key={item.path} to={item.path} end={item.path === '/'}>{item.label}</NavLink>)}</nav></aside> }
