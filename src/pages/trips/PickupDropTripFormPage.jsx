import CrudFormPage from '../../components/crm/CrudFormPage.jsx'
import { pickupDropTripConfig } from './data/tripConfigs.js'

export default function PickupDropTripFormPage() {
  return <CrudFormPage config={pickupDropTripConfig} />
}
