/* eslint-disable no-use-before-define */
import 'babel-polyfill'
import { mount } from 'enzyme'
import { requestData } from 'fetch-normalize-data'
import PropTypes from 'prop-types'
import React, { Fragment, useContext } from 'react'
import { act } from 'react-dom/test-utils'

import { DataContext } from '../DataContext'

const mockFoos = [
  { id: "AE", text: "My foo is here", type: "good" },
  { id: "BF", test: "My other foo also", type: "bad" }
]
const postedMockFoo = { id: "CG", test: "My new foo", type: "good" }

jest.mock('fetch-normalize-data', () => {
  const actualModule = jest.requireActual('fetch-normalize-data')
  const mockFetchData = (url, config) => {
    if (url === 'https://momarx.com/failFoos') {
      return {
        errors: [],
        status: 400
      }
    }
    if (url === 'https://momarx.com/successFoos') {
      if (config.method === 'POST' || config.method === 'PATCH') {
        return {
          datum: config.body,
          status: 200
        }
      }
      return {
        data: mockFoos,
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

const postFoo = dispatch => () => dispatch(requestData({
  apiPath: '/successFoos',
  body: postedMockFoo,
  method: 'POST',
  stateKey: 'foos',
}))

const Foos = ({
  apiPath,
  handleFailGetExpectation,
  handleSuccessGetExpectation,
  handleSuccessPostExpectation
}) => {
  const { data, dispatch } = useContext(DataContext)
  const { foos } = data || {}

  if (apiPath) {
    dispatch(requestData({
      apiPath,
      handleFail: handleFailGetExpectation,
      stateKey: 'foos'
    }))
  }

  if (foos && foos.length === 2) {
    handleSuccessGetExpectation(foos)
  }

  if (foos && foos.length === 3) {
    handleSuccessPostExpectation(foos)
  }

  return (
    <Fragment>
      {(foos || []).map(foo => (
        <div
          className="foo"
          key={foo.id}
        >
          {foo.text}
        </div>
      ))}
      <button
        onClick={postFoo(dispatch)}
        type="button"
      >
        {'Click'}
      </button>
    </Fragment>
  )
}

Foos.defaultProps = {
  apiPath: null,
  handleFailGetExpectation: () => {},
  handleSuccessGetExpectation: () => {},
  handleSuccessPostExpectation: () => {},
}
Foos.propTypes = {
  apiPath: PropTypes.string,
  handleFailGetExpectation: PropTypes.func,
  handleSuccessGetExpectation: PropTypes.func,
  handleSuccessPostExpectation: PropTypes.func
}

describe('when DataContext with Foos is for basic usage', () => {
  describe('when Provide DataContext', () => {
    describe('when request get with success', () => {
      it('should render test component whith foo items', async done => {
        // given
        const expectedFoos = mockFoos
        .map(mockFoo => ({
          ...mockFoo,
          __ACTIVITIES__: ['/successFoos'],
        }))

        // when
        await act(async () => {
          mount(
            <DataContext.Provider config={{ rootUrl: "https://momarx.com" }}>
              <Foos
                apiPath="/successFoos"
                handleSuccessGetExpectation={handleExpectation}
              />
            </DataContext.Provider>
          )
        })

        // then
        function handleExpectation(foos) {
          expect(foos).toStrictEqual(expectedFoos)
          done()
        }

      })
    })

    describe('when request get with fail', () => {
      it('should render test component whith no foo items', async done => {
        // when
        await act(async () => {
          mount(
            <DataContext.Provider config={{ rootUrl: "https://momarx.com" }}>
              <Foos
                apiPath="/failFoos"
                handleFailGetExpectation={handleExpectation}
              />
            </DataContext.Provider>
          )
        })

        // then
        function handleExpectation(state, action) {
          const { payload } = action
          const { errors } = payload
          expect(errors).toHaveLength(2)
          done()
        }
      })
    })

    describe('when request post with success', () => {
      it('should render test component whith one more foo item', async done => {
        // given
        const expectedFoos = [postedMockFoo, ...mockFoos]
        .map(mockFoo => ({
          ...mockFoo,
          __ACTIVITIES__: ['/successFoos'],
        }))

        // when
        await act(async () => {
          const wrapper = mount(
            <DataContext.Provider config={{ rootUrl: "https://momarx.com" }}>
              <Foos
                apiPath="/successFoos"
                handleSuccessPostExpectation={handleExpectation}
              />
            </DataContext.Provider>
          )
          wrapper.find(Foos).find('button').simulate('click')
        })

        // then
        function handleExpectation(foos) {
          expect(foos).toStrictEqual(expectedFoos)
          done()
        }
      })
    })
  })

  describe('when mount with DataContext for several components', () => {
    describe('when request get with success', () => {
      it('should trigger success in other component than the one that did request', async done => {
        // given
        const expectedFoos = mockFoos
        .map(mockFoo => ({
          ...mockFoo,
          __ACTIVITIES__: ['/successFoos'],
        }))

        // when
        await act(async () => {
          mount(
            <Fragment>
              <DataContext.Provider config={{ rootUrl: "https://momarx.com" }}>
                <Foos apiPath="/successFoos" />
                <Foos handleSuccessGetExpectation={handleExpectation} />
              </DataContext.Provider>
            </Fragment>
          )
        })

        // then
        function handleExpectation(foos) {
          expect(foos).toStrictEqual(expectedFoos)
          done()
        }
      })
    })
  })
})
