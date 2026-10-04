import CrudListPage from '../../components/crm/CrudListPage.jsx'
import { driverConfig } from './data/driverConfig.js'

export default function DriverListPage() {
  return <CrudListPage config={driverConfig} />
}
