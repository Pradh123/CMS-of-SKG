import CrudFormPage from '../../components/crm/CrudFormPage.jsx'
import { invoiceConfig } from './data/invoiceConfig.js'

export default function InvoiceFormPage() {
  return <CrudFormPage config={invoiceConfig} />
}
