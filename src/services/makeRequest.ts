import axios from 'axios'
import IRequestParams from '../models/models'

async function makeRequest(params: IRequestParams) {
  const config = {
    method: params.method,
    maxBodyLength: Infinity,
    url: params.url,
    headers: {
      'Content-Type': 'application/json',
      ...params.headers,
    },
    data: params.data,
    params: params.params,
  }

  const response = await axios.request(config)
  return response
}

export default makeRequest
