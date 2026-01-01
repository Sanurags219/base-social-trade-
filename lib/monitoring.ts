/**
 * Sentry Error Tracking
 * Monitor swap, claim, and reputation update failures
 */

import * as Sentry from '@sentry/nextjs'

export function captureSwapError(error: any, swapData?: any) {
  Sentry.captureException(error, {
    tags: {
      feature: 'swap',
      type: 'blockchain'
    },
    contexts: {
      swap: {
        ...swapData
      }
    }
  })
  console.error('SWAP_FAILED', error, swapData)
}

export function captureClaimError(error: any, claimData?: any) {
  Sentry.captureException(error, {
    tags: {
      feature: 'claim',
      type: 'blockchain'
    },
    contexts: {
      claim: {
        ...claimData
      }
    }
  })
  console.error('CLAIM_FAILED', error, claimData)
}

export function captureReputationError(error: any, address?: string) {
  Sentry.captureException(error, {
    tags: {
      feature: 'reputation',
      type: 'onchain_read'
    },
    contexts: {
      reputation: {
        address
      }
    }
  })
  console.error('REPUTATION_FAILED', error, { address })
}

export function captureCreditError(error: any, creditData?: any) {
  Sentry.captureException(error, {
    tags: {
      feature: 'credit',
      type: 'blockchain'
    },
    contexts: {
      credit: {
        ...creditData
      }
    }
  })
  console.error('CREDIT_FAILED', error, creditData)
}

export function captureNetworkError(error: any) {
  Sentry.captureException(error, {
    tags: {
      feature: 'network',
      type: 'wallet_or_rpc'
    }
  })
  console.error('NETWORK_ERROR', error)
}

/**
 * Performance monitoring wrapper
 */
export function withErrorTracking<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  errorHandler: (error: any) => void
): T {
  return (async (...args: any[]) => {
    try {
      return await fn(...args)
    } catch (error) {
      errorHandler(error)
      throw error
    }
  }) as T
}
