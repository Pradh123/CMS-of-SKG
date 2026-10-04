import CrudListPage from '../../components/crm/CrudListPage.jsx'
import { pickupDropTripConfig } from './data/tripConfigs.js'

export default function PickupDropTripListPage() {
  return <CrudListPage config={pickupDropTripConfig} />
}
