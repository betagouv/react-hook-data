/* eslint-disable no-use-before-define */
import 'babel-polyfill'
import { mount } from 'enzyme'
import PropTypes from 'prop-types'
import { requestData } from 'fetch-normalize-data'

import React, { Fragment, useContext } from 'react'
import { act } from 'react-dom/test-utils'

import { DataContext } from '../DataContext'

const mockFoos = [
  { id: "AE", text: "My foo is here", type: "good" },
  { id: "BF", test: "My other foo also", type: "bad" }
]

jest.mock('fetch-normalize-data', () => {
  const actualModule = jest.requireActual('fetch-normalize-data')
  return {
    ...actualModule,
    fetchData: (url, config) => {
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
  }
})

describe('DataContext with Foos basic usage', () => {
  describe('mount with DataContext', () => {
    describe('request with success', () => {
      it('should render test component whith foo items', done => {
        // given
        const Foos = ({ handleExpectation }) => {
          const { data, dispatch } = useContext(DataContext)
          const { foos } = data || {}

          dispatch(requestData({ apiPath: '/successFoos', stateKey: 'foos' }))

          if (foos && foos.length === 2) {
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

        // when
        act(() => {
          mount(
            <DataContext.Provider config={{ rootUrl: "https://momarx.com" }}>
              <Foos handleExpectation={handleExpectation} />
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
        const Foos = ({ handleExpectation }) => {
          const { data, dispatch } = useContext(DataContext)
          const { foos } = data || {}

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

        // when
        act(() => {
          mount(
            <DataContext.Provider config={{ rootUrl: "https://momarx.com" }}>
              <Foos handleExpectation={handleExpectation} />
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
        const Foos = ({ handleExpectation }) => {
          const { data } = useContext(DataContext)
          const { foos } = data || {}

          if (foos && foos.length === 2) {
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

        // when
        act(() => {
          mount(
            <Fragment>
              <DataContext.Provider config={{ rootUrl: "https://momarx.com" }}>
                <DispatcherFoos />
                <Foos handleExpectation={handleExpectation} />
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
