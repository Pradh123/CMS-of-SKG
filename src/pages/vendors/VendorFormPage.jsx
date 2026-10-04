import CrudFormPage from '../../components/crm/CrudFormPage.jsx'
import { vendorConfig } from './data/vendorConfig.js'

export default function VendorFormPage() {
  return <CrudFormPage config={vendorConfig} />
}
