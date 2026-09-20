import { BarChart3, BookOpenText, FileText, LayoutDashboard, Sparkles } from 'lucide-react'

export const menu = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Area SEO', path: '/cms/area-seo', icon: FileText },
  { label: 'Route SEO', path: '/cms/route-seo', icon: BarChart3 },
  { label: 'Blogs', path: '/cms/blog', icon: BookOpenText },
  { label: 'ChatGPT Prompts', path: '/cms/chatgpt-prompts', icon: Sparkles },
]
