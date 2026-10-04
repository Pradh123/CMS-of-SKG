import CrudViewPage from '../../components/crm/CrudViewPage.jsx'
import { driverConfig } from './data/driverConfig.js'

export default function DriverViewPage() {
  return <CrudViewPage config={driverConfig} />
}
