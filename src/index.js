import {
  ASSIGN_DATA,
  DELETE_DATA,
  MERGE_DATA,
  RESET_DATA,
  SET_DATA,
  assignData,
  deleteData,
  createDataReducer,
  fetchData,
  getNormalizedDeletedState,
  getNormalizedMergedState,
  mergeData,
  resetData,
  setData,
} from 'fetch-normalize-data'

export {
  ASSIGN_DATA,
  DELETE_DATA,
  MERGE_DATA,
  RESET_DATA,
  SET_DATA,
  assignData,
  createDataReducer,
  deleteData,
  fetchData,
  getNormalizedDeletedState,
  getNormalizedMergedState,
  mergeData,
  resetData,
  setData,
}

export * from './DataContext'
export * from './selectors'
export { default as withData } from './withData'
