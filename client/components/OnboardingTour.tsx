'use client';

import React, { useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { driver, type Driver, type DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';
import { useUserStore } from '@/store/useUserStore';

export const ONBOARDING_STORAGE_KEY = 'has_completed_onboarding';

export const startOnboardingTour = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('start-onboarding-tour'));
  }
};

// Minimal, clean 2-step tour strictly for mobile screens
const MOBILE_TOUR_STEPS: DriveStep[] = [
  {
    element: '[data-tour="mobile-nav-alumni"]',
    popover: {
      title: 'Alumni Community & Feed',
      description:
        'Connect directly with students, alumni, and faculty. Share posts and start direct chats.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '[data-tour="mobile-nav-events"]',
    popover: {
      title: 'Events Tab',
      description:
        'Browse upcoming campus reunions, seminars, and networking meetups with one-tap registration.',
      side: 'bottom',
      align: 'start',
    },
  },
];

// 2-step focused tour for tablet and desktop workspaces (Alumni & Events)
const DESKTOP_TOUR_STEPS: DriveStep[] = [
  {
    element: '[data-tour="nav-alumni"]',
    popover: {
      title: 'Alumni Community & Feed',
      description:
        'Connect directly with students, alumni, and faculty. Share community posts, follow peers, and engage in real-time direct chats.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '[data-tour="nav-events"]',
    popover: {
      title: 'Campus & Alumni Events',
      description:
        'Browse all upcoming campus reunions, tech symposiums, webinars, and cultural fests with one-click registrations.',
      side: 'bottom',
      align: 'start',
    },
  },
];

export default function OnboardingTour() {
  const pathname = usePathname();
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);

  const runTour = useCallback(() => {
    if (typeof window === 'undefined') return;

    const isMobile = window.innerWidth < 768;

    const markCompleted = () => {
      try {
        localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
      } catch (e) {
        console.error('Failed to save tour completion', e);
      }
      if (isMobile) {
        window.dispatchEvent(new CustomEvent('close-mobile-nav'));
      }
    };

    if (isMobile) {
      // 1. Open the mobile slide-out navigation drawer
      window.dispatchEvent(new CustomEvent('open-mobile-nav'));

      // 2. Allow drawer slide-in animation to complete (300ms) before driving
      setTimeout(() => {
        const activeSteps = MOBILE_TOUR_STEPS.filter((step) => {
          if (!step.element || typeof step.element !== 'string') return false;
          return !!document.querySelector(step.element);
        });

        if (activeSteps.length === 0) {
          window.dispatchEvent(new CustomEvent('close-mobile-nav'));
          return;
        }

        const mobileDriver: Driver = driver({
          animate: true,
          overlayColor: '#000000',
          overlayOpacity: 0.65,
          stagePadding: 4,
          stageRadius: 8,
          showProgress: true,
          progressText: '{{current}} of {{total}}',
          nextBtnText: 'Next →',
          prevBtnText: '← Back',
          doneBtnText: 'Done ✓',
          popoverClass: 'bfgi-tour-popover bfgi-tour-mobile',
          steps: activeSteps,
          onDestroyed: () => {
            markCompleted();
          },
          onCloseClick: () => {
            markCompleted();
            mobileDriver.destroy();
          },
        });

        mobileDriver.drive();
      }, 320);

      return;
    }

    // Desktop & Tablet Tour
    const activeSteps = DESKTOP_TOUR_STEPS.filter((step) => {
      if (!step.element || typeof step.element !== 'string') return false;
      const el = document.querySelector(step.element);
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return (
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        style.opacity !== '0' &&
        rect.width > 0 &&
        rect.height > 0
      );
    });

    if (activeSteps.length === 0) return;

    const desktopDriver: Driver = driver({
      animate: true,
      overlayColor: '#000000',
      overlayOpacity: 0.65,
      stagePadding: 6,
      stageRadius: 10,
      showProgress: true,
      progressText: '{{current}} of {{total}}',
      nextBtnText: 'Next →',
      prevBtnText: '← Back',
      doneBtnText: 'Finish Tour 🎉',
      popoverClass: 'bfgi-tour-popover',
      steps: activeSteps,
      onDestroyed: () => {
        markCompleted();
      },
      onCloseClick: () => {
        markCompleted();
        desktopDriver.destroy();
      },
    });

    desktopDriver.drive();
  }, []);

  // Listen for manual replay events
  useEffect(() => {
    const handleManualTour = () => {
      runTour();
    };

    window.addEventListener('start-onboarding-tour', handleManualTour);
    return () => {
      window.removeEventListener('start-onboarding-tour', handleManualTour);
    };
  }, [runTour]);

  // Auto-start for users after login or first-time visit
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (pathname === '/auth') return;

    const justLoggedIn = sessionStorage.getItem('just_logged_in') === 'true';
    const hasCompleted = localStorage.getItem(ONBOARDING_STORAGE_KEY);

    // If user just logged in, trigger tour immediately!
    if (justLoggedIn) {
      sessionStorage.removeItem('just_logged_in');
      const timer = setTimeout(() => {
        runTour();
      }, 700);
      return () => clearTimeout(timer);
    }

    // First-time logged-in user who hasn't completed onboarding
    if (isAuthenticated && hasCompleted !== 'true') {
      const timer = setTimeout(() => {
        runTour();
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, pathname, runTour]);

  return null;
}
