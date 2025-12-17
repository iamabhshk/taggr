import ReactGA from 'react-ga4';

let isInitialized = false;

export const initAnalytics = () => {
  const trackingId = import.meta.env.VITE_GA_TRACKING_ID;

  if (!trackingId) {
    console.warn('Google Analytics tracking ID not configured. Analytics disabled.');
    return;
  }

  try {
    ReactGA.initialize(trackingId, {
      testMode: import.meta.env.DEV,
    });
    isInitialized = true;
  } catch (error) {
    console.error('Failed to initialize Google Analytics:', error);
  }
};

export const trackPageView = (path: string) => {
  if (!isInitialized) return;
  
  try {
    ReactGA.send({ hitType: 'pageview', page: path });
  } catch (error) {
    console.error('Failed to track page view:', error);
  }
};

export const trackEvent = (
  category: string,
  action: string,
  label?: string,
  value?: number
) => {
  if (!isInitialized) return;
  
  try {
    ReactGA.event({
      category,
      action,
      label,
      value,
    });
  } catch (error) {
    console.error('Failed to track event:', error);
  }
};

