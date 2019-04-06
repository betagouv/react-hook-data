export function configureFetchDataWithRequestFail () {
  fetch.mockResponse(JSON.stringify(
    { global: 'Wrong request for foos' }
  ), { status: 400 })
}

export const successFoos = [
  { id: "AE", text: "My foo is here", type: "good" },
  { id: "BF", test: "My other foo also", type: "bad" }
]

export function configureFetchDataWithRequestSuccess () {
  fetch.mockResponse(JSON.stringify(successFoos), { status: 200 })
}
