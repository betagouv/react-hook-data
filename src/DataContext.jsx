// from https://www.codementor.io/sambhavgore/an-example-use-context-and-hooks-to-share-state-between-different-components-sgop6lnrd
// https://medium.com/@jaryd_34198/seamless-api-requests-with-react-hooks-part-1-7531849d8381
import {
  createDataReducer,
  fetchToSuccessOrFailData
} from 'fetch-normalize-data'
import PropTypes from "prop-types"
import React, { createContext, useEffect, useReducer } from "react"

export const DataContext = createContext({})

const BaseProvider = DataContext.Provider

export const Provider = props => {
  const { children, config, initialState } = props

  const dataReducer = createDataReducer(initialState)
  const reducer = useReducer(dataReducer, initialState)
  const [data, _dispatch] = reducer

  function dispatch (action) {
    if (/REQUEST_DATA_(DELETE|GET|POST|PUT|PATCH)_(.*)/.test(action.type)) {
      useEffect(() => {
        _dispatch(action)
        const fetchConfig = Object.assign({}, config, action.config)
        fetchToSuccessOrFailData(reducer, fetchConfig)
      }, [action.tag || action.type])
      return
    }
    useEffect(() => {
      _dispatch(action)
    })
  }

  const value = {
    data,
    dispatch
  }

  return (
    <BaseProvider value={value}>
      {children}
    </BaseProvider>
  )
}

Provider.propTypes = {
  children: PropTypes.node,
  config: PropTypes.shape(),
  initialState: PropTypes.shape()
}

Provider.defaultProps = {
  children: null,
  config: null,
  initialState: {}
}

DataContext.Provider = Provider

export const { Consumer } = DataContext

export default DataContext
