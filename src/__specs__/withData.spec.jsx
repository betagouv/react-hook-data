/* eslint-disable no-use-before-define */
import 'babel-polyfill'
import { mount } from 'enzyme'
import { requestData } from 'fetch-normalize-data'
import PropTypes from 'prop-types'
import React, { Fragment } from 'react'
import { act } from 'react-dom/test-utils'

import { DataContext } from '../DataContext'
import withData from '../withData'

const mockFoos = [
  { id: 'AE', text: 'My foo is here', type: 'good' },
  { id: 'BF', test: 'My other foo also', type: 'bad' },
]

jest.mock('fetch-normalize-data', () => {
  const actualModule = jest.requireActual('fetch-normalize-data')
  const mockFetchData = (url, config) => {
    if (url === 'https://momarx.com/failFoos') {
      return {
        errors: [],
        status: 400,
      }
    }
    if (url === 'https://momarx.com/successFoos') {
      return {
        data: mockFoos,
        status: 200,
      }
    }
    return actualModule.fetchData(url, config)
  }
  return {
    ...actualModule,
    fetchToSuccessOrFailData: (reducer, config) =>
      actualModule.fetchToSuccessOrFailData(
        reducer,
        Object.assign({}, config, { fetchData: mockFetchData })
      ),
  }
})

const Foos = ({
  apiPath,
  foos,
  handleFailGetExpectation,
  handleSuccessGetExpectation,
  requestGetFoos,
}) => {
  if (apiPath) {
    requestGetFoos(handleFailGetExpectation)
  }

  if (foos && foos.length === 1) {
    handleSuccessGetExpectation(foos)
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
    </Fragment>
  )
}

Foos.defaultProps = {
  apiPath: null,
  foos: null,
  handleFailGetExpectation: () => {},
  handleSuccessGetExpectation: () => {},
}
Foos.propTypes = {
  apiPath: PropTypes.string,
  foos: PropTypes.arrayOf(PropTypes.shape()),
  handleFailGetExpectation: PropTypes.func,
  handleSuccessGetExpectation: PropTypes.func,
  requestGetFoos: PropTypes.func.isRequired
}

const mapDataToProps = (data, props) => ({
  foos: (data.foos || []).filter(foo => foo.type === props.type),
})

const mapDispatchToProps = (dispatch, ownProps) => ({
  requestGetFoos: handleFailGetExpectation => dispatch(
    requestData({
      apiPath: ownProps.apiPath,
      handleFail: handleFailGetExpectation,
      stateKey: 'foos',
    })
  )
})
const FoosContainer = withData(mapDataToProps, mapDispatchToProps)(Foos)

describe('when useData with Foos basic usage', () => {
  describe('when mount with DataContext', () => {
    describe('when request with success', () => {
      it('should render test component whith foo items', async done => {
        // given
        const expectedFoos = mockFoos
          .filter(mockFoo => mockFoo.type === 'good')
          .map(mockFoo => ({
            ...mockFoo,
            __ACTIVITIES__: ['/successFoos'],
          }))

        // when
        await act(async () => {
          mount(
            <DataContext.Provider config={{ rootUrl: 'https://momarx.com' }}>
              <FoosContainer
                apiPath="/successFoos"
                handleSuccessGetExpectation={handleExpectation}
                type="good"
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

    describe('when request with fail', () => {
      it('should render test component whith no foo items', async done => {
        // when
        await act(async () => {
          mount(
            <DataContext.Provider config={{ rootUrl: 'https://momarx.com' }}>
              <FoosContainer
                apiPath="/failFoos"
                handleFailGetExpectation={handleExpectation}
                type="good"
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
  })

  describe('when mount with DataContext for several components', () => {
    describe('when request with success', () => {
      it('should trigger success in other component than the one that did request', async done => {
        // given
        const expectedFoos = mockFoos
          .filter(mockFoo => mockFoo.type === 'good')
          .map(mockFoo => ({
            ...mockFoo,
            __ACTIVITIES__: ['/successFoos'],
          }))

        // when
        await act(async () => {
          mount(
            <Fragment>
              <DataContext.Provider config={{ rootUrl: 'https://momarx.com' }}>
                <FoosContainer apiPath="/successFoos" />
                <FoosContainer
                  handleSuccessGetExpectation={handleExpectation}
                  type="good"
                />
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
