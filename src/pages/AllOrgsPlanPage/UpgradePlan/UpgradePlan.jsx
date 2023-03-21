import PropTypes from 'prop-types'
import { useState } from 'react'
import { useParams } from 'react-router-dom'

import {
  accountDetailsPropType,
  planPropType,
  useAccountDetails,
  usePlans,
} from 'services/account'
import { useMyContexts } from 'services/user'
import {
  canApplySentryUpgrade,
  findSentryPlans,
  isEnterprisePlan,
  useProPlans,
} from 'shared/utils/billing'
import A from 'ui/A'
import Card from 'ui/Card'
import Select from 'ui/Select'

import SentryUpgradeForm from './SentryUpgradeForm'
import UpgradeDetails from './UpgradeDetails'
import UpgradeForm from './UpgradeForm'

const mergeOrgs = ({ contexts }) => [
  contexts?.currentUser,
  ...(contexts ? contexts?.myOrganizations : []),
]

const determinePlan = ({ accountDetails }) =>
  accountDetails?.rootOrganization?.plan ?? accountDetails?.plan

const FormDetails = ({
  accountDetails,
  organizationName,
  plan,
  plans,
  proPlanMonth,
  proPlanYear,
  sentryPlanMonth,
  sentryPlanYear,
}) => {
  if (isEnterprisePlan(plan?.value)) {
    return (
      <div className="items-center pt-4">
        <p>
          This organization is on an enterprise plan, to change or cancel your
          plan please contact <A to={{ pageName: 'sales' }}>sales@codecov.io</A>
        </p>
      </div>
    )
  }

  if (canApplySentryUpgrade({ plans })) {
    return (
      <SentryUpgradeForm
        accountDetails={accountDetails}
        sentryPlanYear={sentryPlanYear}
        sentryPlanMonth={sentryPlanMonth}
        organizationName={organizationName}
      />
    )
  }

  return (
    <UpgradeForm
      accountDetails={accountDetails}
      proPlanYear={proPlanYear}
      proPlanMonth={proPlanMonth}
      organizationName={organizationName}
    />
  )
}

FormDetails.propTypes = {
  accountDetails: accountDetailsPropType,
  organizationName: PropTypes.string,
  plan: PropTypes.shape({
    value: PropTypes.string,
  }),
  plans: PropTypes.arrayOf(planPropType),
  proPlanMonth: planPropType,
  proPlanYear: planPropType,
  sentryPlanMonth: planPropType,
  sentryPlanYear: planPropType,
}

function UpgradePlan() {
  const { provider } = useParams()
  const [organizationName, setOrganizationName] = useState()
  const { data: plans } = usePlans(provider)
  const { proPlanMonth, proPlanYear } = useProPlans({ plans })
  const { sentryPlanMonth, sentryPlanYear } = findSentryPlans({ plans })
  const { data: contexts } = useMyContexts({ provider })
  const { data: accountDetails } = useAccountDetails({
    provider,
    owner: organizationName,
    opts: {
      enabled: !!organizationName,
      suspense: false,
    },
  })

  const organizations = mergeOrgs({ contexts })
  const plan = determinePlan({ accountDetails })

  return (
    <div className="mt-6 flex flex-col gap-8 md:w-11/12 md:flex-row lg:w-10/12">
      <Card variant="large">
        <UpgradeDetails
          accountDetails={accountDetails}
          organizationName={organizationName}
          plan={plan}
          plans={plans}
          proPlanMonth={proPlanMonth}
          proPlanYear={proPlanYear}
          sentryPlanYear={sentryPlanYear}
          sentryPlanMonth={sentryPlanMonth}
        />
      </Card>
      <div className="flex flex-col gap-4 md:w-2/3">
        <Card variant="upgradeForm">
          <div>
            <h3 className="pb-2 text-base font-semibold">Organization</h3>
            <div className="xl:w-5/12">
              <Select
                items={organizations}
                renderItem={(item) => item?.username}
                onChange={({ username }) => setOrganizationName(username)}
                placeholder="Select organization"
                ariaName="select organization"
                dataMarketing="select organization"
              />
            </div>
          </div>
          <FormDetails
            accountDetails={accountDetails}
            organizationName={organizationName}
            plan={plan}
            plans={plans}
            proPlanMonth={proPlanMonth}
            proPlanYear={proPlanYear}
            sentryPlanYear={sentryPlanYear}
            sentryPlanMonth={sentryPlanMonth}
          />
        </Card>
      </div>
    </div>
  )
}

export default UpgradePlan