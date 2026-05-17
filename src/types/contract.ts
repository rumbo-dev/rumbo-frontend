// must match backend Contract model in rumbo-backend/prisma/schema.prisma

export type ContractStatus = 'ACTIVE' | 'EXPIRING_SOON' | 'UNDERUTILIZED' | 'EXPIRED'

export interface Contract {
  id: string
  contractNumber: string
  userId: string

  carrier: string
  lane: string
  originPort: string
  destinationPort: string
  containerType: string

  rateUsd: number
  volumeCommittedTeu: number
  volumeUsedTeu: number

  validFrom: string
  validUntil: string

  status: ContractStatus
  notes?: string | null

  createdAt: string
  updatedAt: string
}
