import * as Sentry from '@sentry/node';
import config from '../config/environment.js';

export const initSentry = () => {
  const dsn = process.env.SENTRY_DSN;

  if (!dsn) {
    console.warn('Sentry DSN not configured. Error tracking disabled.');
    return;
  }

  Sentry.init({
    dsn,
    environment: config.env,
    tracesSampleRate: 1.0,
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
    ],
    beforeSend(event, hint) {
      // Don't send errors in development
      if (config.env === 'development') {
        console.error('Sentry event (dev mode):', event, hint);
        return null;
      }
      return event;
    },
  });
};

