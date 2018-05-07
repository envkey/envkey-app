import axios from 'axios'
import axiosRetry from 'axios-retry'

const client = axios.create({timeout: 5000})

axiosRetry(client, {retries: 3})

export const s3Client = client
