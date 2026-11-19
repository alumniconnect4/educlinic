import React, { useEffect, useRef, useCallback } from 'react';
import { driver } from 'driver.js';
import type { DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';

export const startChatSidebarTour = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('start-chat-sidebar-tour'));
  }
};

export const resetChatSidebarTour = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('has_completed_chat_tour');
    window.dispatchEvent(new CustomEvent('start-chat-sidebar-tour'));
  }
};

export const ChatSidebarTour: React.FC = () => {
  const driverObjRef = useRef<ReturnType<typeof driver> | null>(null);

  const runTour = useCallback(() => {
    const isMobile = window.innerWidth < 768;

    // If mobile, open sidebar drawer first so the targets are mounted & visible
    if (isMobile) {
      window.dispatchEvent(new CustomEvent('open-chat-sidebar'));
    }

    const startDriverInstance = () => {
      const preferredSide = isMobile ? 'bottom' : 'right';

      const steps: DriveStep[] = [
        {
          element: '[data-tour="sidebar-feed"]',
          popover: {
            title: 'Community Feed',
            description:
              'Browse latest discussions, questions, project updates, and achievements shared across the college.',
            side: preferredSide,
            align: 'start',
          },
        },
        {
          element: '[data-tour="sidebar-connect"]',
          popover: {
            title: 'Connect & Network',
            description:
              'Discover and network with students, alumni mentors, and developer contributors across all departments.',
            side: preferredSide,
            align: 'start',
          },
        },
        {
          element: '[data-tour="sidebar-chat"]',
          popover: {
            title: 'Direct Messages',
            description:
              'Initiate private 1-on-1 chats for career guidance, project collaboration, and mentorship.',
            side: preferredSide,
            align: 'start',
          },
        },
        {
          element: '[data-tour="sidebar-profile"]',
          popover: {
            title: 'My Profile & Bio',
            description:
              'Manage your bio, school credentials, social links, pronouns, and track your followers and posts.',
            side: preferredSide,
            align: 'start',
          },
        },
        {
          element: '[data-tour="sidebar-trending"]',
          popover: {
            title: 'Trending Topics',
            description:
              'Filter the feed instantly by popular hashtags like #Placements, #Hackathon, #Internships, and #Coding.',
            side: preferredSide,
            align: 'start',
          },
        },
      ];

      // Filter out elements not currently mounted
      const validSteps = steps.filter((step) => {
        if (typeof step.element === 'string') {
          const el = document.querySelector(step.element);
          return el !== null && el.getBoundingClientRect().height > 0;
        }
        return true;
      });

      if (validSteps.length === 0) return;

      const finishAndClose = () => {
        localStorage.setItem('has_completed_chat_tour', 'true');
        if (isMobile) {
          window.dispatchEvent(new CustomEvent('close-chat-sidebar'));
        }
      };

      const driverInstance = driver({
        showProgress: true,
        animate: true,
        overlayColor: 'rgba(0, 0, 0, 0.65)',
        stagePadding: 5,
        stageRadius: 8,
        allowClose: true,
        popoverClass: `chat-tour-popover ${isMobile ? 'chat-tour-mobile' : ''}`,
        nextBtnText: 'Next →',
        prevBtnText: '← Back',
        doneBtnText: 'Finish ✓',
        onDestroyed: () => {
          finishAndClose();
        },
        steps: validSteps,
      });

      driverObjRef.current = driverInstance;
      driverInstance.drive();
    };

    // On mobile, allow 250ms for the drawer animation to settle
    if (isMobile) {
      setTimeout(startDriverInstance, 250);
    } else {
      startDriverInstance();
    }
  }, []);

  useEffect(() => {
    const handleStartEvent = () => {
      runTour();
    };

    window.addEventListener('start-chat-sidebar-tour', handleStartEvent);

    // Auto-trigger for first-time visitors after a short delay
    const hasCompleted = localStorage.getItem('has_completed_chat_tour');
    let autoTimer: ReturnType<typeof setTimeout> | null = null;
    if (!hasCompleted) {
      autoTimer = setTimeout(() => {
        runTour();
      }, 700);
    }

    return () => {
      window.removeEventListener('start-chat-sidebar-tour', handleStartEvent);
      if (autoTimer) clearTimeout(autoTimer);
      if (driverObjRef.current?.isActive()) {
        driverObjRef.current.destroy();
      }
    };
  }, [runTour]);

  return null;
};
