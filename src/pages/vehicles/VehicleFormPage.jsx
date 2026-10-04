import CrudFormPage from '../../components/crm/CrudFormPage.jsx'
import { vehicleConfig } from './data/vehicleConfig.js'

export default function VehicleFormPage() {
  return <CrudFormPage config={vehicleConfig} />
}
