import LogRocket from 'logrocket';

const APP_ID = import.meta.env.VITE_LOGROCKET_APP_ID || 'pehavh/hub-entertain-web';
const enabled = import.meta.env.PROD; 

if (enabled) {
  LogRocket.init(APP_ID, {
    dom: { inputSanitizer: true }, 
    network: {
      requestSanitizer: (request) => {
        for (const key of Object.keys(request.headers || {})) {
          if (key.toLowerCase() === 'authorization') request.headers[key] = '[REDACTED]';
        }
        if (request.url.toLowerCase().includes('/auth/')) request.body = undefined;
        return request;
      },
      responseSanitizer: (response) => {
        if (response.body?.includes('"token"')) response.body = undefined;
        return response;
      },
    },
  });
}

export const identifyUser = (user) =>
  enabled && LogRocket.identify(user.id, { name: user.fullName, email: user.email });

export const resetUser = () => enabled && LogRocket.startNewSession?.();

export const captureError = (error, extra) =>
  enabled && LogRocket.captureException(error, { extra });