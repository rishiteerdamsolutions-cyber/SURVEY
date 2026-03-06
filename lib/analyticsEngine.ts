import type { SurveyResponse, SurveyAnalysis } from './types';

export function calculateCompanyAnalytics(
  responses: SurveyResponse[],
  companySlug: string
): SurveyAnalysis {
  const total = responses.length;
  if (total === 0) {
    return {
      companySlug,
      totalResponses: 0,
      lendingStats: {
        lentMoneyPercent: 0,
        facedDelaysPercent: 0,
        lostMoneyPercent: 0,
        avgLoanSizeDistribution: {},
        hesitatedPercent: 0,
        wantPlatformPercent: 0,
      },
    paymentStats: {
      experiencedDelaysPercent: 0,
      mostCommonType: 'N/A',
      delayTypeDistribution: {},
      avgDelayDistribution: {},
      sent5PlusRemindersPercent: 0,
      avgAmountDistribution: {},
      mentalStressPercent: 0,
    },
      interestStats: {
        platformInterestPercent: 0,
        earlyAccessPercent: 0,
      },
      updatedAt: new Date(),
    };
  }

  const lenders = responses.filter((r) => r.answersPart1.hasLentMoney === 'yes');
  const lenderCount = lenders.length;
  const facedDelays = lenders.filter((r) => r.answersPart1.facedRepaymentDelays === 'yes').length;
  const lostMoney = lenders.filter((r) => r.answersPart1.lostMoney === 'yes').length;
  const hesitated = lenders.filter((r) => r.answersPart1.hesitatedToAsk === 'yes').length;
  const wantPlatform = responses.filter(
    (r) => r.answersPart1.wantStructuredPlatform === 'yes'
  ).length;

  const loanSizeCounts: Record<string, number> = {};
  lenders.forEach((r) => {
    const size = r.answersPart1.averageLoanSize || 'unknown';
    loanSizeCounts[size] = (loanSizeCounts[size] || 0) + 1;
  });

  const delayedPayers = responses.filter(
    (r) => r.answersPart2.experiencedDelayedPayments === 'yes'
  );
  const delayTypeDistribution: Record<string, number> = {};
  delayedPayers.forEach((r) => {
    const type = r.answersPart2.delayedPaymentType || 'other';
    delayTypeDistribution[type] = (delayTypeDistribution[type] || 0) + 1;
  });
  const mostCommonType =
    Object.entries(delayTypeDistribution).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

  const delayDurationCounts: Record<string, number> = {};
  delayedPayers.forEach((r) => {
    const dur = r.answersPart2.averageDelayDuration || 'unknown';
    delayDurationCounts[dur] = (delayDurationCounts[dur] || 0) + 1;
  });

  const sent5Reminders = delayedPayers.filter(
    (r) => r.answersPart2.sentMoreThan5Reminders === 'yes'
  ).length;

  const amountCounts: Record<string, number> = {};
  delayedPayers.forEach((r) => {
    const amt = r.answersPart2.averageDelayedAmount || 'unknown';
    amountCounts[amt] = (amountCounts[amt] || 0) + 1;
  });

  const mentalStress = delayedPayers.filter(
    (r) => r.answersPart2.experiencedMentalStress === 'yes'
  ).length;

  const earlyAccess = responses.filter((r) => r.earlyAccessInterest === 'yes').length;

  const platformInterest = responses.filter(
    (r) => r.answersPart1.wantStructuredPlatform === 'yes'
  ).length;

  return {
    companySlug,
    totalResponses: total,
    lendingStats: {
      lentMoneyPercent: Math.round((lenderCount / total) * 100),
      facedDelaysPercent: Math.round((facedDelays / (lenderCount || 1)) * 100),
      lostMoneyPercent: Math.round((lostMoney / (lenderCount || 1)) * 100),
      avgLoanSizeDistribution: loanSizeCounts,
      hesitatedPercent: Math.round((hesitated / (lenderCount || 1)) * 100),
      wantPlatformPercent: Math.round((wantPlatform / total) * 100),
    },
    paymentStats: {
      experiencedDelaysPercent: Math.round((delayedPayers.length / total) * 100),
      mostCommonType,
      delayTypeDistribution,
      avgDelayDistribution: delayDurationCounts,
      sent5PlusRemindersPercent: Math.round(
        (sent5Reminders / (delayedPayers.length || 1)) * 100
      ),
      avgAmountDistribution: amountCounts,
      mentalStressPercent: Math.round(
        (mentalStress / (delayedPayers.length || 1)) * 100
      ),
    },
    interestStats: {
      platformInterestPercent: Math.round((platformInterest / total) * 100),
      earlyAccessPercent: Math.round((earlyAccess / total) * 100),
    },
    updatedAt: new Date(),
  };
}

export function calculateGlobalAnalytics(
  allResponses: { companySlug: string; responses: SurveyResponse[] }[]
) {
  const flat = allResponses.flatMap((c) => c.responses);
  const total = flat.length;
  const companies = new Set(allResponses.map((c) => c.companySlug)).size;

  if (total === 0) {
    return {
      totalResponses: 0,
      totalCompanies: 0,
      globalLendingRate: 0,
      globalDelayedPaymentRate: 0,
      globalInterestRate: 0,
    };
  }

  const lenders = flat.filter((r) => r.answersPart1.hasLentMoney === 'yes');
  const delayedPayers = flat.filter(
    (r) => r.answersPart2.experiencedDelayedPayments === 'yes'
  );
  const interested = flat.filter(
    (r) =>
      r.answersPart1.wantStructuredPlatform === 'yes' || r.earlyAccessInterest === 'yes'
  );

  return {
    totalResponses: total,
    totalCompanies: companies,
    globalLendingRate: Math.round((lenders.length / total) * 100),
    globalDelayedPaymentRate: Math.round((delayedPayers.length / total) * 100),
    globalInterestRate: Math.round((interested.length / total) * 100),
  };
}
