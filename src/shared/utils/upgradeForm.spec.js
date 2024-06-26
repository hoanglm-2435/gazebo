import { TrialStatuses } from 'services/account'
import { Plans } from 'shared/utils/billing'

import {
  calculatePrice,
  calculatePriceProPlan,
  calculatePriceTeamPlan,
  calculateSentryNonBundledCost,
  extractSeats,
  getDefaultValuesUpgradeForm,
  getSchema,
  shouldRenderCancelLink,
} from './upgradeForm'

describe('calculatePrice', () => {
  describe('isSentryUpgrade is true and isSelectedPlanTeam is false', () => {
    describe('seat count is at five', () => {
      it('returns base price', () => {
        const result = calculatePrice({
          seats: 5,
          baseUnitPrice: 10,
          isSentryUpgrade: true,
          sentryPrice: 29,
          isSelectedPlanTeam: false,
        })

        expect(result).toBe(29)
      })
    })

    describe('seat count is greater then five', () => {
      it('returns base price plus additional seats', () => {
        const result = calculatePrice({
          seats: 6,
          baseUnitPrice: 10,
          isSentryUpgrade: true,
          sentryPrice: 29,
          isSelectedPlanTeam: false,
        })

        expect(result).toBe(39)
      })
    })
  })

  describe('isSentryUpgrade is false', () => {
    describe('when isSelectedPlanTeam is false', () => {
      it('returns base price times amount of seats', () => {
        const result = calculatePrice({
          seats: 5,
          baseUnitPrice: 12,
          isSentryUpgrade: false,
          sentryPrice: 29,
          isSelectedPlanTeam: false,
        })

        expect(result).toBe(60)
      })
    })
    describe('when isSelectedPlanTeam is true', () => {
      it('returns base price times amount of seats', () => {
        const result = calculatePrice({
          seats: 5,
          baseUnitPrice: 12,
          isSentryUpgrade: false,
          sentryPrice: 29,
          isSelectedPlanTeam: true,
        })

        expect(result).toBe(60)
      })
    })
  })
})

describe('calculatePriceProPlan', () => {
  it('returns base price', () => {
    const result = calculatePriceProPlan({
      seats: 5,
      baseUnitPrice: 10,
    })

    expect(result).toBe(50)
  })
})

describe('calculatePriceTeamPlan', () => {
  it('returns base price', () => {
    const result = calculatePriceTeamPlan({
      seats: 5,
      baseUnitPrice: 10,
    })

    expect(result).toBe(50)
  })
})

describe('getDefaultValuesUpgradeForm', () => {
  const proPlanYear = { value: Plans.USERS_PR_INAPPY }
  const sentryPlanYear = { value: Plans.USERS_SENTRYY }
  const teamPlanMonth = { value: Plans.USERS_TEAMM }

  describe('when current plan is basic', () => {
    it('returns pro year plan', () => {
      const accountDetails = {
        plan: { value: Plans.USERS_BASIC, quantity: 1 },
      }

      const data = getDefaultValuesUpgradeForm({
        accountDetails,
        proPlanYear,
        plans: [proPlanYear],
      })

      expect(data).toStrictEqual({
        newPlan: Plans.USERS_PR_INAPPY,
        seats: 2,
      })
    })

    it('returns sentry year plan if user is sentry upgrade', () => {
      const accountDetails = {
        plan: { value: Plans.USERS_BASIC, quantity: 1 },
      }

      const data = getDefaultValuesUpgradeForm({
        accountDetails,
        proPlanYear,
        plans: [proPlanYear, sentryPlanYear],
      })

      expect(data).toStrictEqual({
        newPlan: Plans.USERS_SENTRYY,
        seats: 5,
      })
    })
  })

  describe('when current plan is team monthly', () => {
    it('returns team monthly plan', () => {
      const accountDetails = {
        plan: { value: Plans.USERS_TEAMM, quantity: 1, billingRate: 'monthly' },
      }

      const data = getDefaultValuesUpgradeForm({
        accountDetails,
        proPlanYear,
        plans: [teamPlanMonth],
      })

      expect(data).toStrictEqual({
        newPlan: 'users-teamm',
        seats: 2,
      })
    })

    it('returns pro sentry plan if user is sentry upgrade', () => {
      const accountDetails = {
        plan: { value: Plans.USERS_TEAMM, quantity: 1 },
      }

      const data = getDefaultValuesUpgradeForm({
        accountDetails,
        proPlanYear,
        plans: [proPlanYear, sentryPlanYear],
      })

      expect(data).toStrictEqual({
        newPlan: Plans.USERS_SENTRYY,
        seats: 5,
      })
    })
  })

  it('returns current plan if the user is on a paid plan', () => {
    const accountDetails = {
      plan: { value: Plans.USERS_PR_INAPPM, quantity: 2 },
    }

    const data = getDefaultValuesUpgradeForm({
      accountDetails,
      proPlanYear,
      plans: [proPlanYear],
    })

    expect(data).toStrictEqual({
      newPlan: Plans.USERS_PR_INAPPM,
      seats: 2,
    })
  })
})

describe('getSchema', () => {
  it('passes parsing when all conditions are met', () => {
    const accountDetails = {
      activatedUserCount: 2,
    }
    const schema = getSchema({ accountDetails, minSeats: 5 })

    const response = schema.safeParse({
      seats: 10,
      newPlan: Plans.USERS_PR_INAPPY,
    })
    expect(response.success).toEqual(true)
    expect(response.error).toBeUndefined()
  })

  it('fails to parse when newPlan is not a string', () => {
    const accountDetails = {
      activatedUserCount: 2,
    }
    const schema = getSchema({ accountDetails, minSeats: 5 })

    const response = schema.safeParse({ seats: 5, newPlan: 5 })
    expect(response.success).toEqual(false)

    const [issue] = response.error.issues
    expect(issue).toEqual(
      expect.objectContaining({
        message: 'Plan type is required to be a string',
      })
    )
  })

  it('fails to parse when seats is not a number', () => {
    const accountDetails = {
      activatedUserCount: 2,
    }
    const schema = getSchema({ accountDetails, minSeats: 5 })

    const response = schema.safeParse({ seats: 'ahh' })
    expect(response.success).toEqual(false)

    const [issue] = response.error.issues
    expect(issue).toEqual(
      expect.objectContaining({
        message: 'Seats is required to be a number',
      })
    )
  })

  it('fails to parse when the seats are below the minimum', () => {
    const accountDetails = {
      activatedUserCount: 2,
    }
    const schema = getSchema({ accountDetails, minSeats: 5 })

    const response = schema.safeParse({ seats: 3 })
    expect(response.success).toEqual(false)

    const [issue] = response.error.issues
    expect(issue).toEqual(
      expect.objectContaining({
        message: 'You cannot purchase a per user plan for less than 5 users',
      })
    )
  })

  it('fails to parse when seats are below activated seats', () => {
    const accountDetails = {
      activatedUserCount: 5,
    }
    const schema = getSchema({ accountDetails, minSeats: 1 })

    const response = schema.safeParse({ seats: 3 })
    expect(response.success).toBe(false)

    const [issue] = response.error.issues
    expect(issue).toEqual(
      expect.objectContaining({
        message: 'Must deactivate more users before downgrading plans',
      })
    )
  })

  it('passes when seats are below activated seats and user is on trial', () => {
    const accountDetails = {
      activatedUserCount: 2,
      plan: {
        value: Plans.USERS_TRIAL,
      },
    }
    const schema = getSchema({
      accountDetails,
      minSeats: 5,
      trialStatus: TrialStatuses.ONGOING,
    })

    const response = schema.safeParse({
      seats: 10,
      newPlan: Plans.USERS_PR_INAPPY,
    })
    expect(response.success).toEqual(true)
    expect(response.error).toBeUndefined()
  })

  describe('when the user upgrades to team plan', () => {
    it('fails to parse when seats are above max seats', () => {
      const accountDetails = {
        plan: {
          value: Plans.USERS_INAPPY,
        },
      }
      const schema = getSchema({
        accountDetails,
        selectedPlan: {
          value: Plans.USERS_TEAMY,
        },
      })

      const response = schema.safeParse({
        seats: 12,
        newPlan: Plans.USERS_TEAMY,
      })
      expect(response.success).toBe(false)

      const [issue] = response.error.issues
      expect(issue).toEqual(
        expect.objectContaining({
          message: 'Team plan is only available for 10 seats or fewer.',
        })
      )
    })

    it('passes when seats are below max seats for team yearly plan', () => {
      const accountDetails = {
        plan: {
          value: Plans.USERS_INAPPY,
        },
      }
      const schema = getSchema({
        accountDetails,
        selectedPlan: {
          value: Plans.USERS_TEAMY,
        },
      })

      const response = schema.safeParse({
        seats: 9,
        newPlan: Plans.USERS_TEAMY,
      })

      expect(response.success).toEqual(true)
      expect(response.error).toBeUndefined()
    })
  })

  it('passes when seats are below max seats for team monthly plan', () => {
    const accountDetails = {
      plan: {
        value: Plans.USERS_INAPPY,
      },
    }
    const schema = getSchema({
      accountDetails,
      selectedPlan: {
        value: Plans.USERS_TEAMM,
      },
    })

    const response = schema.safeParse({
      seats: 9,
      newPlan: Plans.USERS_TEAMM,
    })

    expect(response.success).toEqual(true)
    expect(response.error).toBeUndefined()
  })
})

describe('calculateSentryNonBundledCost', () => {
  it('returns calculated cost', () => {
    const total = calculateSentryNonBundledCost({ baseUnitPrice: 10 })
    expect(total).toEqual(252)
  })
})

describe('extractSeats', () => {
  describe('user on free plan and can upgrade to sentry plan', () => {
    it('returns min seats when members are less than min', () => {
      const seats = extractSeats({
        value: Plans.USERS_BASIC,
        quantity: 1,
        isSentryUpgrade: true,
        activatedUserCount: 0,
        inactivatedUserCount: 0,
      })
      expect(seats).toEqual(5)
    })

    it('returns members number as seats when members are greater than min', () => {
      const seats = extractSeats({
        value: Plans.USERS_BASIC,
        quantity: 1,
        isSentryUpgrade: true,
        activatedUserCount: 10,
        inactiveUserCount: 2,
      })
      expect(seats).toEqual(12)
    })
  })

  describe('user on free plan and can not upgrade to sentry plan', () => {
    it('returns min seats when members are less than min', () => {
      const seats = extractSeats({
        value: Plans.USERS_BASIC,
        quantity: 1,
        isSentryUpgrade: false,
        activatedUserCount: 0,
        inactivatedUserCount: 0,
      })
      expect(seats).toEqual(2)
    })

    it('returns members number as seats when members are greater than min', () => {
      const seats = extractSeats({
        value: Plans.USERS_BASIC,
        quantity: 1,
        activatedUserCount: 10,
        inactiveUserCount: 2,
        isSentryUpgrade: false,
      })
      expect(seats).toEqual(12)
    })
  })

  describe('user on paid plan', () => {
    it('returns members number as seats', () => {
      const seats = extractSeats({
        value: Plans.USERS_PR_INAPPM,
        quantity: 8,
        activatedUserCount: 12,
        inactiveUserCount: 0,
        isSentryUpgrade: false,
      })
      expect(seats).toEqual(8)
    })
  })

  describe('user on sentry plan', () => {
    it('returns members number as seats', () => {
      const seats = extractSeats({
        value: Plans.USERS_SENTRYM,
        quantity: 8,
        activatedUserCount: 12,
        inactiveUserCount: 0,
        isSentryUpgrade: false,
      })
      expect(seats).toEqual(8)
    })
  })

  describe('user on paid plan and can upgrade to sentry plan', () => {
    it('returns members number as seats if greater than min', () => {
      const seats = extractSeats({
        value: Plans.USERS_PR_INAPPM,
        quantity: 8,
        activatedUserCount: 12,
        inactiveUserCount: 0,
        isSentryUpgrade: true,
      })
      expect(seats).toEqual(8)
    })

    it('returns min seats if less than min', () => {
      const seats = extractSeats({
        value: Plans.USERS_PR_INAPPM,
        quantity: 2,
        isSentryUpgrade: true,
      })
      expect(seats).toEqual(5)
    })
  })

  describe('user on trial plan plan', () => {
    describe('user has access to sentry upgrade', () => {
      it('returns sentry plan base seat count as seats', () => {
        const seats = extractSeats({
          value: Plans.USERS_TRIAL,
          quantity: 8,
          activatedUserCount: 12,
          inactiveUserCount: 0,
          isSentryUpgrade: true,
          trialStatus: TrialStatuses.ONGOING,
        })

        expect(seats).toEqual(5)
      })
    })

    describe('user does not have access to sentry upgrade', () => {
      it('returns pro plan base seat count as seats', () => {
        const seats = extractSeats({
          value: Plans.USERS_TRIAL,
          quantity: 8,
          activatedUserCount: 12,
          inactiveUserCount: 0,
          isSentryUpgrade: false,
          trialStatus: TrialStatuses.ONGOING,
        })

        expect(seats).toEqual(2)
      })
    })
  })
})

describe('shouldRenderCancelLink', () => {
  it('returns true', () => {
    // eslint-disable-next-line testing-library/render-result-naming-convention
    const value = shouldRenderCancelLink(
      false,
      { value: Plans.USERS_PR_INAPPY },
      ''
    )

    expect(value).toBeTruthy()
  })

  describe('user is on a free plan', () => {
    it('returns false', () => {
      // eslint-disable-next-line testing-library/render-result-naming-convention
      const value = shouldRenderCancelLink(
        false,
        { value: Plans.USERS_BASIC },
        ''
      )

      expect(value).toBeFalsy()
    })
  })

  describe('user is currently on a trial', () => {
    it('returns false', () => {
      // eslint-disable-next-line testing-library/render-result-naming-convention
      const value = shouldRenderCancelLink(
        false,
        { value: Plans.USERS_TRIAL },
        TrialStatuses.ONGOING
      )

      expect(value).toBeFalsy()
    })
  })

  describe('user has already cancelled their plan', () => {
    it('returns false', () => {
      // eslint-disable-next-line testing-library/render-result-naming-convention
      const value = shouldRenderCancelLink(
        true,
        { value: Plans.USERS_PR_INAPPY },
        ''
      )

      expect(value).toBeFalsy()
    })
  })

  describe('user intended plan is Team', () => {
    it('sets new plan to team', () => {
      const accountDetails = {
        plan: { value: Plans.USERS_BASIC, quantity: 1 },
      }
      const plans = [
        { value: Plans.USERS_TEAMY },
        { value: Plans.USERS_PR_INAPPY },
      ]

      const data = getDefaultValuesUpgradeForm({
        accountDetails,
        plans,
        selectedPlan: { value: Plans.USERS_TEAMY },
      })

      expect(data).toStrictEqual({
        newPlan: Plans.USERS_TEAMY,
        seats: 2,
      })
    })
  })
})
