import { selectEntitiesByKeyAndJoin as _selectEntitiesByKeyAndJoin } from 'fetch-normalize-data'

const selectEntitiesByKeyAndJoin = (data, ...args) =>
  _selectEntitiesByKeyAndJoin({ data }, ...args)

export default selectEntitiesByKeyAndJoin
