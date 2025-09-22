// Utility function for scrolling to top
export const scrollToTop = (behavior = "smooth") => {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: behavior,
  });
};

// Utility function for scrolling to a specific element
export const scrollToElement = (elementId, behavior = "smooth") => {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({ behavior: behavior });
  }
};

// Hook for handling scroll to top functionality
export const useScrollToTop = () => {
  return {
    scrollToTop,
    scrollToElement,
  };
};
