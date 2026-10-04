import CrudListPage from '../../components/crm/CrudListPage.jsx'
import { branchConfig } from './data/masterConfigs.js'

export default function BranchListPage() {
  return <CrudListPage config={branchConfig} />
}
