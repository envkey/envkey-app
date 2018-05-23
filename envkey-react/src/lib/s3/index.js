import axios from 'axios'
import axiosRetry from 'axios-retry'
import R from 'ramda'

const client = axios.create({timeout: 3000})

axiosRetry(client, {
  retries: 5,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: R.always(true),
  shouldResetTimeout: true
})

export const s3Client = client
