import { selectEntityByKeyAndId as _selectEntityByKeyAndId } from 'fetch-normalize-data'

const selectEntityByKeyAndId = (data, ...args) =>
  _selectEntityByKeyAndId({ data }, ...args)

export default selectEntityByKeyAndId
