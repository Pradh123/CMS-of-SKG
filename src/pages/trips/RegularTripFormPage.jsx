import CrudFormPage from '../../components/crm/CrudFormPage.jsx'
import { regularTripConfig } from './data/tripConfigs.js'

export default function RegularTripFormPage() {
  return <CrudFormPage config={regularTripConfig} />
}
