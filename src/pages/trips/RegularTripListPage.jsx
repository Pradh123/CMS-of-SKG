import CrudListPage from '../../components/crm/CrudListPage.jsx'
import { regularTripConfig } from './data/tripConfigs.js'

export default function RegularTripListPage() {
  return <CrudListPage config={regularTripConfig} />
}
