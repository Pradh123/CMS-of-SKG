import CrudFormPage from '../../components/crm/CrudFormPage.jsx'
import { partyConfig } from './data/partyConfig.js'

export default function PartyFormPage() {
  return <CrudFormPage config={partyConfig} />
}
