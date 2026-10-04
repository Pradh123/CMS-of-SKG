import CrudViewPage from '../../components/crm/CrudViewPage.jsx'
import { vehicleConfig } from './data/vehicleConfig.js'

export default function VehicleViewPage() {
  return <CrudViewPage config={vehicleConfig} />
}
