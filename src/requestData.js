import { requestData as requestDataCreator } from 'fetch-normalize-data'

export const requestData = (...args) => requestDataCreator(...args)

export default requestData
