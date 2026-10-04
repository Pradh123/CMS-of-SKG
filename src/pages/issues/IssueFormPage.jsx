import CrudFormPage from '../../components/crm/CrudFormPage.jsx'
import { issueConfig } from './data/issueConfig.js'

export default function IssueFormPage() {
  return <CrudFormPage config={issueConfig} />
}
