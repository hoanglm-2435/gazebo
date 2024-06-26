import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'

import Api from 'shared/api'

export const TrialStatuses = {
  NOT_STARTED: 'NOT_STARTED',
  ONGOING: 'ONGOING',
  EXPIRED: 'EXPIRED',
  CANNOT_TRIAL: 'CANNOT_TRIAL',
} as const

const PlanSchema = z.object({
  baseUnitPrice: z.number(),
  benefits: z.array(z.string()),
  billingRate: z.string().nullable(),
  marketingName: z.string(),
  monthlyUploadLimit: z.number().nullable(),
  value: z.string(),
  pretrialUsersCount: z.number().nullable(),
  trialEndDate: z.string().nullable(),
  trialStatus: z.nativeEnum(TrialStatuses),
  trialStartDate: z.string().nullable(),
  trialTotalDays: z.number().nullable(),
  planUserCount: z.number().nullable(),
  hasSeatsLeft: z.boolean(),
})

export type Plan = z.infer<typeof PlanSchema>

const PretrialPlanSchema = z.object({
  baseUnitPrice: z.number(),
  benefits: z.array(z.string()),
  billingRate: z.string().nullable(),
  marketingName: z.string(),
  monthlyUploadLimit: z.number().nullable(),
  value: z.string(),
})

export type PretrialPlan = z.infer<typeof PretrialPlanSchema>

export const PlanDataSchema = z
  .object({
    owner: z
      .object({
        hasPrivateRepos: z.boolean(),
        plan: PlanSchema.nullish(),
        pretrialPlan: PretrialPlanSchema.nullish(),
      })
      .nullish(),
  })
  .nullish()

export interface UsePlanDataArgs {
  provider: string
  owner: string
  opts?: {
    enabled?: boolean
  }
}

export const query = `
  query GetPlanData($owner: String!) {
    owner(username: $owner) {
      hasPrivateRepos
      plan {
        baseUnitPrice
        benefits
        billingRate
        marketingName
        monthlyUploadLimit
        value
        pretrialUsersCount
        trialEndDate
        trialStatus
        trialStartDate
        trialTotalDays
        planUserCount
        hasSeatsLeft
      }
      pretrialPlan {
        baseUnitPrice
        benefits
        billingRate
        marketingName
        monthlyUploadLimit
        value
      }
    }
  }
`

export const usePlanData = ({ provider, owner, opts }: UsePlanDataArgs) =>
  useQuery({
    queryKey: ['GetPlanData', provider, owner, query],
    queryFn: ({ signal }) =>
      Api.graphql({
        provider,
        query,
        signal,
        variables: {
          owner,
        },
      }).then((res) => {
        const parsedRes = PlanDataSchema.safeParse(res?.data)

        if (!parsedRes.success) {
          return Promise.reject({
            status: 404,
            data: null,
          })
        }

        return parsedRes.data?.owner ?? null
      }),
    ...(!!opts && opts),
  })
