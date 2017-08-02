import axios from 'axios'
import R from 'ramda'

const opts =  {
  baseURL: process.env.API_HOST,
  timeout: process.env.NODE_ENV == "development" ? 20000 : 8000
}

export const authenticatedClient = (auth={})=> {
  return axios.create({
    ...opts,
    headers: R.pick(["access-token", "uid", "client"], auth)
  })
}

export default axios.create(opts)

