// Clear Cart Button - Utility component to clear cart data
// Useful for development and testing purposes

import { useCart } from "../../store/Hooks/User/hook.useCart.js";
import Button from "./Button.jsx";

/**
 * Clear cart button component for development use
 */
const ClearCartButton = ({ className = "" }) => {
  const { clearCart, uniqueItemCount, isLoading } = useCart();

  const handleClearCart = () => {
    if (
      window.confirm(
        `Are you sure you want to clear all ${uniqueItemCount} items from your cart?`
      )
    ) {
      clearCart();
    }
  };

  if (uniqueItemCount === 0) {
    return null; // Don't show button if cart is empty
  }

  return (
    <Button
      variant="danger"
      size="sm"
      onClick={handleClearCart}
      loading={isLoading}
      className={`${className}`}
    >
      Clear Cart ({uniqueItemCount})
    </Button>
  );
};

export default ClearCartButton;
