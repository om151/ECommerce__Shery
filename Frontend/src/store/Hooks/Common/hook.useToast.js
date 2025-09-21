// useToast Hook - Manages toast notifications
// Provides easy-to-use functions for showing different types of toasts

import { useCallback, useState } from "react";

export const useToast = () => {
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "info",
  });

  const showToast = useCallback((message, type = "info", duration = 3000) => {
    setToast({
      show: true,
      message,
      type,
      duration,
    });
  }, []);

  const showSuccess = useCallback(
    (message, duration = 3000) => {
      showToast(message, "success", duration);
    },
    [showToast]
  );

  const showError = useCallback(
    (message, duration = 4000) => {
      showToast(message, "error", duration);
    },
    [showToast]
  );

  const showInfo = useCallback(
    (message, duration = 3000) => {
      showToast(message, "info", duration);
    },
    [showToast]
  );

  const showWarning = useCallback(
    (message, duration = 3000) => {
      showToast(message, "warning", duration);
    },
    [showToast]
  );

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, show: false }));
  }, []);

  return {
    toast,
    showToast,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    hideToast,
  };
};
