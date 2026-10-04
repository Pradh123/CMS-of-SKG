import CrudListPage from '../../components/crm/CrudListPage.jsx'
import { vehicleConfig } from './data/vehicleConfig.js'

export default function VehicleListPage() {
  return <CrudListPage config={vehicleConfig} />
}
