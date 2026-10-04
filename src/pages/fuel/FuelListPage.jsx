import CrudListPage from '../../components/crm/CrudListPage.jsx'
import { fuelConfig } from './data/fuelConfig.js'

export default function FuelListPage() {
  return <CrudListPage config={fuelConfig} />
}
