import axios from 'axios'
import R from 'ramda'
import axiosRetry from 'axios-retry'

const
  opts =  {
    baseURL: process.env.API_HOST,
    timeout: 30000
  },

  defaultClient = axios.create(opts)

axiosRetry(defaultClient, {retries: 3})

export const authenticatedClient = (auth={})=> {
  const client = axios.create({
    ...opts,
    headers: R.pick(["access-token", "uid", "client"], auth)
  })
  axiosRetry(client, {retries: 3})
  return client
}

export default defaultClient

