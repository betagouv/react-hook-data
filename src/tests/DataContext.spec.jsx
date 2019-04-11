/* eslint-disable no-use-before-define */
import 'babel-polyfill'
import { mount } from 'enzyme'
import PropTypes from 'prop-types'
import React, { Fragment, useContext } from 'react'
import { act } from 'react-dom/test-utils'

import { DataContext } from '../DataContext'
import { requestData } from '../requestData'

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
      if (config.method === 'POST' || config.method === 'PATCH') {
        return {
          payload: { datum: config.body },
          status: 200
        }
      }
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

describe('DataContext with Foos basic usage', () => {
  describe('Provide DataContext', () => {
    describe('request get with success', () => {
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

    describe('request get with fail', () => {
      it('should render test component whith no foo items', done => {
        // given
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

    describe('request post with success', () => {
      it.only('should render test component whith one more foo item', done => {
        // given
        const Foos = ({ handleExpectation }) => {
          const { data, dispatch } = useContext(DataContext)
          const { foos } = data || {}

          dispatch(requestData({
            apiPath: '/successFoos',
            effect: true,
            stateKey: 'foos'
          }))

          if (foos && foos.length === 3) {
            handleExpectation()
          }

          return (
            <Fragment>
              {(foos || []).map(foo => (
                <div className="foo" key={foo.id}>
                  {foo.text}
                </div>
              ))}
              <button
                onClick={() => {
                  dispatch(requestData({
                    apiPath: '/successFoos',
                    body: { id: "CG", test: "My new foo", type: "good" },
                    method: 'POST',
                    stateKey: 'foos',
                  }))
                }}
                type="button"
              >
                Click
              </button>
            </Fragment>
          )
        }
        Foos.propTypes = {
          handleExpectation: PropTypes.func.isRequired
        }

        // when
        act(() => {
          const wrapper = mount(
            <DataContext.Provider config={{ rootUrl: "https://momarx.com" }}>
              <Foos handleExpectation={handleExpectation} />
            </DataContext.Provider>
          )
          wrapper.find(Foos).find('button').simulate('click')
        })

        // then
        function handleExpectation() {
          done()
        }
      })
    })

  })

  describe('mount with DataContext for several components', () => {
    describe('request get with success', () => {
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
