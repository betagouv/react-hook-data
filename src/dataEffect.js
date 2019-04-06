import {
  failData,
  fetchData,
  getUrlFromConfig,
  isSuccessStatus,
  successData
} from 'fetch-normalize-data'

export async function dataEffect(reducer, config) {
  const [data, dispatch] = reducer
  const { handleFail, handleSuccess } = config

  const url = getUrlFromConfig(config)

  const fetchDataMethod = config.fetchData || fetchData

  try {

    const fetchResult = await fetchDataMethod(url, config)

    if (!fetchResult) {
      return
    }

    const { ok, payload, status } = fetchResult
    Object.assign(config, { ok, status })
    const action = { config, payload }

    const isSuccess = isSuccessStatus(status)

    if (isSuccess) {
      dispatch(successData(payload, config))

      if (handleSuccess) {
        handleSuccess(data, action)
      }

      return
    }

    if (payload.errors) {

      dispatch(failData(payload, config))

      if (handleFail) {
        handleFail(data, action)
      }

      throw Error(payload.errors)
    }

  } catch (error) {
    Object.assign(config, { ok: false, status: 500 })
    const errors = [
      {
        global: ['Erreur serveur. Tentez de rafraîchir la page.'],
      },
      {
        data: [String(error)],
      },
    ]
    dispatch(failData({ payload: { errors } }, config))

    if (handleFail) {
      handleFail(data, { config, payload: { errors } })
    }

    throw Error(errors)
  }
}

export default dataEffect
