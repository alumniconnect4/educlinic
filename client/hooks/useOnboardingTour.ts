'use client';

import { useCallback } from 'react';
import {
  startOnboardingTour,
  ONBOARDING_STORAGE_KEY,
} from '@/components/OnboardingTour';

export function useOnboardingTour() {
  const startTour = useCallback(() => {
    startOnboardingTour();
  }, []);

  const resetTour = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(ONBOARDING_STORAGE_KEY);
      startOnboardingTour();
    }
  }, []);

  return {
    startTour,
    resetTour,
  };
}
