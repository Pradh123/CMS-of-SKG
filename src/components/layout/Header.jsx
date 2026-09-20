import useAuth from '../../hooks/useAuth.js'
export default function Header() { const { user, logout } = useAuth(); return <header className="topbar"><span className="font-semibold">Content Management</span><div className="flex items-center gap-4"><span>{user}</span><button onClick={logout} className="text-blue-700 cursor-pointer">Logout</button></div></header> }
