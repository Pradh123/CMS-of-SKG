import CrudListPage from '../../components/crm/CrudListPage.jsx'
import { issueConfig } from './data/issueConfig.js'

export default function IssueListPage() {
  return <CrudListPage config={issueConfig} />
}
