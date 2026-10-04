import CrudFormPage from '../../components/crm/CrudFormPage.jsx'
import { driverConfig } from './data/driverConfig.js'

export default function DriverFormPage() {
  return <CrudFormPage config={driverConfig} />
}
