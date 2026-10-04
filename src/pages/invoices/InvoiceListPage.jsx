import CrudListPage from '../../components/crm/CrudListPage.jsx'
import { invoiceConfig } from './data/invoiceConfig.js'

export default function InvoiceListPage() {
  return <CrudListPage config={invoiceConfig} />
}
