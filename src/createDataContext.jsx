// from https://www.codementor.io/sambhavgore/an-example-use-context-and-hooks-to-share-state-between-different-components-sgop6lnrd
// https://medium.com/@jaryd_34198/seamless-api-requests-with-react-hooks-part-1-7531849d8381
import {
  getConfigWithDefaultValues,
  createDataReducer
} from 'fetch-normalize-data'
import PropTypes from "prop-types"
import React, { createContext, useEffect, useReducer, useState } from "react"

import { dataEffect } from './dataEffect'

export const createDataContext = (extraConfig={}) => {
  const { initialState } = extraConfig
  const Context = createContext({})
  const BaseProvider = Context.Provider

  const dataReducer = createDataReducer(initialState)

  const Provider = props => {
    const { children } = props
    const [hasAlreadyRequested, setHasAlreadyRequested] = useState(false)

    const reducer = useReducer(dataReducer, initialState)
    const [data, _dispatch] = reducer

    function dispatch (action) {
      if (/REQUEST_DATA_(DELETE|GET|POST|PUT|PATCH)_(.*)/.test(action.type)) {
        if (hasAlreadyRequested) {
          return
        }
        setHasAlreadyRequested(true)
        useEffect(() => {
          const effectConfig = getConfigWithDefaultValues(
            Object.assign({}, extraConfig, action.config)
          )
          dataEffect(reducer, effectConfig)
        }, [_dispatch])
      }
      _dispatch(action)
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
    children: PropTypes.node
  }

  Provider.defaultProps = {
    children: null
  }

  Context.Provider = Provider

  return Context
}

export default createDataContext
