import axios from 'axios'
import API_ENDPOINTS from './apiConfig'

export interface ResetRequestResult {
  message: string
  debug_otp?: string
  email_sent?: boolean
}

export interface ConfirmResetPayload {
  email: string
  otp: string
  new_password: string
  new_password_confirm: string
}

export const passwordResetService = {
  async requestReset(email: string): Promise<ResetRequestResult> {
    const { data } = await axios.post(API_ENDPOINTS.auth.resetPassword(), {
      email: email.trim().toLowerCase(),
    })
    return data
  },

  async confirmReset(payload: ConfirmResetPayload): Promise<{ message: string }> {
    const { data } = await axios.post(API_ENDPOINTS.auth.confirmReset(), {
      email: payload.email.trim().toLowerCase(),
      otp: payload.otp.trim(),
      new_password: payload.new_password,
      new_password_confirm: payload.new_password_confirm,
    })
    return data
  },
}
