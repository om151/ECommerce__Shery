import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // Scroll to top when route changes (including query params)
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth", // Smooth scrolling animation
    });
  }, [pathname, search]); // Also trigger on search params change for filtering/pagination

  return null; // This component doesn't render anything
};

export default ScrollToTop;
