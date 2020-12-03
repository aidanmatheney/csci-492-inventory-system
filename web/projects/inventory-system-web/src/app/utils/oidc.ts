import {
  UserManager as OidcUserManager,
  User as OidcUser,
} from 'oidc-client';

import {imperative$} from './observable';

export const selectOidcUserLoaded = (oidcUserManager: OidcUserManager) => {
  return imperative$<OidcUser>(next => {
    const handleUserLoaded = (oidcUser: OidcUser) => next(oidcUser);
    oidcUserManager.events.addUserLoaded(handleUserLoaded);
    return () => oidcUserManager.events.removeUserLoaded(handleUserLoaded);
  });
};
export const selectOidcUserUnloaded = (oidcUserManager: OidcUserManager) => {
  return imperative$<void>(next => {
    const handleUserUnloaded = () => next();
    oidcUserManager.events.addUserUnloaded(handleUserUnloaded);
    return () => oidcUserManager.events.removeUserUnloaded(handleUserUnloaded);
  });
};
export const selectOidcSilentRenewError = (oidcUserManager: OidcUserManager) => {
  return imperative$<Error>(next => {
    const handleSilentRenewError = (error: Error) => next(error);
    oidcUserManager.events.addSilentRenewError(handleSilentRenewError);
    return () => oidcUserManager.events.removeSilentRenewError(handleSilentRenewError);
  });
};
export const selectOidcUserSignedOut = (oidcUserManager: OidcUserManager) => {
  return imperative$<void>(next => {
    const handleUserSignedOut = () => next();
    oidcUserManager.events.addUserSignedOut(handleUserSignedOut);
    return () => oidcUserManager.events.removeUserSignedOut(handleUserSignedOut);
  });
};
export const selectOidcUserSessionChanged = (oidcUserManager: OidcUserManager) => {
  return imperative$<void>(next => {
    const handleUserSessionChanged = () => next();
    oidcUserManager.events.addUserSessionChanged(handleUserSessionChanged);
    return () => oidcUserManager.events.removeUserSessionChanged(handleUserSessionChanged);
  });
};
export const selectOidcAccessTokenExpiring = (oidcUserManager: OidcUserManager) => {
  return imperative$<void>(next => {
    const handleAccessTokenExpiring = () => next();
    oidcUserManager.events.addAccessTokenExpiring(handleAccessTokenExpiring);
    return () => oidcUserManager.events.removeAccessTokenExpiring(handleAccessTokenExpiring);
  });
};
export const selectOidcAccessTokenExpired = (oidcUserManager: OidcUserManager) => {
  return imperative$<void>(next => {
    const handleAccessTokenExpired = () => next();
    oidcUserManager.events.addAccessTokenExpired(handleAccessTokenExpired);
    return () => oidcUserManager.events.removeAccessTokenExpired(handleAccessTokenExpired);
  });
};
