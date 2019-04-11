import React, { useContext } from 'react'

import { DataContext } from './DataContext'

export const withData = (mapStateToProps, mapDispatchToProps) => WrappedComponent => {
  const Mapper = props => {
    const { data, dispatch } = useContext(DataContext)

    let stateProps = {}
    if (mapStateToProps) {
      stateProps = mapStateToProps(data, props)
    }

    let dispatchProps = {}
    if (mapDispatchToProps) {
      dispatchProps = mapDispatchToProps(dispatch, props)
    } else {
      dispatchProps = { dispatch }
    }

    return (
      <WrappedComponent
        {...props}
        {...stateProps}
        {...dispatchProps}
      />
    )
  }
  return Mapper
}

export default withData
