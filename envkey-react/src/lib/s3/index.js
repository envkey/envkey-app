import axios from 'axios'
import axiosRetry from 'axios-retry'

const
  baseOpts =  {
    timeout: 10000
  }

export const

  s3Client = (opts={})=> {
    const client = axios.create({...baseOpts, ...opts})
    axiosRetry(client, {retries: 3})
    return client
  }
