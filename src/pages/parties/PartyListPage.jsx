import CrudListPage from '../../components/crm/CrudListPage.jsx'
import { partyConfig } from './data/partyConfig.js'

export default function PartyListPage() {
  return <CrudListPage config={partyConfig} />
}
