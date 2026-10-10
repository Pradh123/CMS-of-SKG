import useCollectionRecords from './useCollectionRecords.js'

export default function useCrudRecords(config) {
  return useCollectionRecords(config?.key)
}
