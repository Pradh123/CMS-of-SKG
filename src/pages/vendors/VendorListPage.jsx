import CrudListPage from '../../components/crm/CrudListPage.jsx'
import { vendorConfig } from './data/vendorConfig.js'

export default function VendorListPage() {
  return <CrudListPage config={vendorConfig} />
}
