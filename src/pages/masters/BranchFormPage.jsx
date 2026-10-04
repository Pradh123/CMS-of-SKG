import CrudFormPage from '../../components/crm/CrudFormPage.jsx'
import { branchConfig } from './data/masterConfigs.js'

export default function BranchFormPage() {
  return <CrudFormPage config={branchConfig} />
}
