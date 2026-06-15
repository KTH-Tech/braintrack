import { useEffect, useState } from "react";

const POLL_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

export function useSwUpdate() {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    let cancelled = false;

    function checkForWaiting(registration: ServiceWorkerRegistration) {
      if (registration.waiting && !cancelled) {
        setWaitingWorker(registration.waiting);
      }
    }

    let stateChangeHandler: (() => void) | null = null;
    let updateFoundHandler: (() => void) | null = null;
    let registrationRef: ServiceWorkerRegistration | null = null;
    let installingRef: ServiceWorker | null = null;
    let pollIntervalId: ReturnType<typeof setInterval> | null = null;
    let visibilityHandler: (() => void) | null = null;

    navigator.serviceWorker.getRegistration().then((registration) => {
      if (!registration || cancelled) return;
      registrationRef = registration;

      checkForWaiting(registration);

      updateFoundHandler = () => {
        const installing = registration.installing;
        if (!installing) return;
        installingRef = installing;

        stateChangeHandler = () => {
          if (installing.state === "installed" && navigator.serviceWorker.controller && !cancelled) {
            setWaitingWorker(registration.waiting);
          }
        };

        installing.addEventListener("statechange", stateChangeHandler);
      };

      registration.addEventListener("updatefound", updateFoundHandler);

      pollIntervalId = setInterval(() => {
        if (!cancelled && document.visibilityState === "visible") {
          registration.update().catch(() => {});
        }
      }, POLL_INTERVAL_MS);

      visibilityHandler = () => {
        if (!cancelled && document.visibilityState === "visible") {
          registration.update().catch(() => {});
        }
      };
      document.addEventListener("visibilitychange", visibilityHandler);
    });

    let refreshing = false;
    const controllerChangeHandler = () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    };
    navigator.serviceWorker.addEventListener("controllerchange", controllerChangeHandler);

    return () => {
      cancelled = true;
      if (pollIntervalId !== null) {
        clearInterval(pollIntervalId);
      }
      if (visibilityHandler) {
        document.removeEventListener("visibilitychange", visibilityHandler);
      }
      navigator.serviceWorker.removeEventListener("controllerchange", controllerChangeHandler);
      if (registrationRef && updateFoundHandler) {
        registrationRef.removeEventListener("updatefound", updateFoundHandler);
      }
      if (installingRef && stateChangeHandler) {
        installingRef.removeEventListener("statechange", stateChangeHandler);
      }
    };
  }, []);

  function applyUpdate() {
    if (!waitingWorker) return;
    waitingWorker.postMessage({ type: "SKIP_WAITING" });
    setWaitingWorker(null);
  }

  return { updateAvailable: !!waitingWorker, applyUpdate };
}
