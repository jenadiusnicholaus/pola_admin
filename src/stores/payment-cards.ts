// src/stores/cards.ts

import { defineStore } from 'pinia'
import { sleep } from '../services/utils'

// Type definitions
export enum PaymentSystemType {
  Visa = 'visa',
  Mastercard = 'mastercard',
  Amex = 'amex',
  Discover = 'discover',
}

export interface PaymentCard {
  id: string
  name: string
  isPrimary: boolean
  paymentSystem: PaymentSystemType
  cardNumberMasked: string
  expirationDate: string
}

// Simulated fetch function
const fetchPaymentCards = async () => {
  await sleep(1000)
  return [
    {
      id: '1',
      name: 'Main card',
      isPrimary: true,
      paymentSystem: PaymentSystemType.Visa,
      cardNumberMasked: '****1679',
      expirationDate: '0924',
    },
    {
      id: '2',
      name: 'Online shopping',
      isPrimary: false,
      paymentSystem: PaymentSystemType.Mastercard,
      cardNumberMasked: '****8921',
      expirationDate: '1123',
    },
    {
      id: '3',
      name: 'Backup Visa',
      isPrimary: false,
      paymentSystem: PaymentSystemType.Mastercard,
      cardNumberMasked: '****4523',
      expirationDate: '1222',
    },
  ]
}

export const usePaymentCardsStore = defineStore({
  id: 'paymentCards',
  state: () => ({
    paymentCards: [] as PaymentCard[],
    loading: false,
  }),
  getters: {
    currentPaymentCard: (state): PaymentCard | undefined =>
      state.paymentCards.find((card: PaymentCard) => card.isPrimary),
    allPaymentCards: (state) => state.paymentCards,
  },
  actions: {
    async load() {
      this.loading = true
      this.paymentCards = await fetchPaymentCards()
      this.loading = false
    },
    create(card: PaymentCard) {
      this.paymentCards.unshift(card)
    },
    update(card: PaymentCard) {
      const index = this.paymentCards.findIndex((existingCard: PaymentCard) => existingCard.id === card.id)
      if (index !== -1) {
        this.paymentCards.splice(index, 1, card)
      }
    },
    remove(cardId: string) {
      this.paymentCards = this.paymentCards.filter((card: PaymentCard) => card.id !== cardId)
    },
  },
})
