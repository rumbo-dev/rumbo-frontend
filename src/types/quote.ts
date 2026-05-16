// must match backend Quote model in rumbo-backend/prisma/schema.prisma
// Locker shape de los Json fields que vienen del backend.

export type QuoteStatus =
  | 'WAITING_FOR_DATA'
  | 'READY_TO_QUOTE'
  | 'QUOTED_DRAFT'
  | 'SENT_AWAITING_CLIENT'
  | 'ACCEPTED'
  | 'LOST'

export type QuoteChannel = 'EMAIL' | 'WHATSAPP' | 'WEB_FORM'

export type ContainerType =
  | 'FCL_20GP'
  | 'FCL_40GP'
  | 'FCL_40HC'
  | 'FCL_40RF'
  | 'LCL'
  | 'AIR'

export type AgentParsedFields = Record<string, number>

export type MissingFields = string[]

export interface CarrierOption {
  name: string
  isRecommended?: boolean
  via: 'direct' | 'transshipment'
  viaDetail?: string
  transitDays: number
  sailingsPerWeek: number
  onTimePct12m: number
  contractRate?: number | null
  contractRef?: string | null
  spotRate: number
  yourFinalCost: number
  status: string
}

export interface Surcharge {
  name: string
  amount: number
  description?: string | null
}

export interface Quote {
  id: string
  quoteCode: string
  userId: string

  clientName: string
  clientEmail?: string | null
  isNewClient: boolean
  channel: QuoteChannel
  originalMessage: string
  receivedAt: string

  status: QuoteStatus

  origin?: string | null
  originCountry?: string | null
  destination?: string | null
  destinationCountry?: string | null
  product?: string | null
  ncmCode?: string | null
  containerType?: ContainerType | string | null
  containerCount?: number | null
  weightKg?: number | null
  cbm?: number | null
  incoterm?: string | null
  readyDate?: string | null
  specialHandling?: string | null

  aiParsedFields?: AgentParsedFields | null
  aiParsingConfidence?: number | null
  missingFields?: MissingFields | null

  recommendedCarrier?: string | null
  recommendedReason?: string | null
  carrierComparison?: CarrierOption[] | null
  markupPercent: number
  markupAmount?: number | null
  baseCarrierCost?: number | null
  surchargesTotal?: number | null
  surchargesBreakdown?: Surcharge[] | null
  quoteFinalUsd?: number | null
  quoteValidDays: number

  draftSubject?: string | null
  draftBody?: string | null
  draftAiConfidence?: number | null

  clientHistoryWinRate?: number | null
  clientPreferredCarrier?: string | null
  clientAverageMarkup?: number | null

  createdAt: string
  updatedAt: string
}
