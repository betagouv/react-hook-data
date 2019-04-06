import React, { useContext } from 'react'

import { DataContext } from './DataContext'

export const withData = mapDataToProps => WrappedComponent => {
  const Mapper = props => {
    const { data, dispatch } = useContext(DataContext)
    let dataProps = {}
    if (mapDataToProps) {
      dataProps = mapDataToProps(data, props)
    }
    return (
      <WrappedComponent
        {...props}
        {...dataProps}
        dispatch={dispatch}
      />
    )
  }
  return Mapper
}

export default withData
