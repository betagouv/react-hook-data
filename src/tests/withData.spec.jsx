/* eslint-disable no-use-before-define */
import 'babel-polyfill'
import { mount } from 'enzyme'
import PropTypes from 'prop-types'
import React, { Fragment, useContext } from 'react'
import { act } from 'react-dom/test-utils'

import { DataContext } from '../DataContext'
import { requestData } from '../requestData'
import { withData } from '../withData'

const mockFoos = [
  { id: "AE", text: "My foo is here", type: "good" },
  { id: "BF", test: "My other foo also", type: "bad" }
]

jest.mock('fetch-normalize-data', () => {
  const actualModule = jest.requireActual('fetch-normalize-data')
  const mockFetchData = (url, config) => {
    if (url === 'https://momarx.com/failFoos') {
      return {
        payload: { errors: [] },
        status: 400
      }
    }
    if (url === 'https://momarx.com/successFoos') {
      return {
        payload: { data: mockFoos },
        status: 200
      }
    }
    return actualModule.fetchData(url, config)
  }
  return {
    ...actualModule,
    fetchToSuccessOrFailData: (reducer, config) =>
      actualModule.fetchToSuccessOrFailData(reducer,
        Object.assign({}, config, { fetchData: mockFetchData})
      )
  }
})

describe('useData with Foos basic usage', () => {
  describe('mount with DataContext', () => {
    describe('request with success', () => {
      it('should render test component whith foo items', done => {
        // given
        const Foos = ({ foos, handleExpectation }) => {
          const { dispatch } = useContext(DataContext)
          dispatch(requestData({ apiPath: '/successFoos', stateKey: 'foos' }))

          if (foos && foos.length === 1) {
            handleExpectation()
          }

          return (
            <Fragment>
              {(foos || []).map(foo => (
                <div className="foo" key={foo.id}>
                  {foo.text}
                </div>
              ))}
            </Fragment>
          )
        }
        Foos.propTypes = {
          handleExpectation: PropTypes.func.isRequired
        }
        const mapDataToProps = (data, props) => ({
          foos: (data.foos || []).filter(foo => foo.type === props.type)
        })
        const FoosContainer = withData(mapDataToProps)(Foos)

        // when
        act(() => {
          mount(
            <DataContext.Provider config={{ rootUrl: "https://momarx.com" }}>
              <FoosContainer
                handleExpectation={handleExpectation}
                type="good"
              />
            </DataContext.Provider>
          )
        })

        // then
        function handleExpectation() {
          done()
        }

      })
    })

    describe('request with fail', () => {
      it('should render test component whith no foo items', done => {
        // given
        jest.mock('fetch-normalize-data', () => {
          const actualModule = jest.requireActual('fetch-normalize-data')
          return {
            ...actualModule,
            fetchData: () => ({
              errors: [],
              status: 400
            })
          }
        })
        const Foos = ({ foos, handleExpectation }) => {
          const { dispatch } = useContext(DataContext)

          dispatch(requestData({
            apiPath: '/failFoos',
            handleFail: handleExpectation,
            stateKey: 'foos'
          }))

          return (
            <Fragment>
              {(foos || []).map(foo => (
                <div className="foo" key={foo.id}>
                  {foo.text}
                </div>
              ))}
            </Fragment>
          )
        }
        Foos.propTypes = {
          handleExpectation: PropTypes.func.isRequired
        }
        const mapDataToProps = (data, props) => ({
          foos: (data.foos || []).filter(foo => foo.type === props.type)
        })
        const FoosContainer = withData(mapDataToProps)(Foos)

        // when
        act(() => {
          mount(
            <DataContext.Provider config={{ rootUrl: "https://momarx.com" }}>
              <FoosContainer handleExpectation={handleExpectation} type="good"/>
            </DataContext.Provider>
          )
        })

        // then
        function handleExpectation() {
          done()
        }
      })
    })
  })

  describe('mount with DataContext for several components', () => {
    describe('request with success', () => {
      it('trigger success in other component than the one that did request', done => {
        // given
        const DispatcherFoos = () => {
          const { dispatch } = useContext(DataContext)

          dispatch(requestData({
            apiPath: '/successFoos',
            stateKey: 'foos'
          }))

          return null
        }

        const Foos = ({ foos, handleExpectation }) => {
          if (foos && foos.length === 1) {
            handleExpectation()
          }

          return (
            <Fragment>
              {(foos || []).map(foo => (
                <div className="foo" key={foo.id}>
                  {foo.text}
                </div>
              ))}
            </Fragment>
          )
        }
        Foos.propTypes = {
          handleExpectation: PropTypes.func.isRequired
        }
        const mapDataToProps = (data, props) => ({
          foos: (data.foos || []).filter(foo => foo.type === props.type)
        })
        const FoosContainer = withData(mapDataToProps)(Foos)

        // when
        act(() => {
          mount(
            <Fragment>
              <DataContext.Provider config={{ rootUrl: "https://momarx.com" }}>
                <DispatcherFoos />
                <FoosContainer handleExpectation={handleExpectation} type="good" />
              </DataContext.Provider>
            </Fragment>
          )
        })

        // then
        function handleExpectation() {
          done()
        }
      })
    })
  })
})
