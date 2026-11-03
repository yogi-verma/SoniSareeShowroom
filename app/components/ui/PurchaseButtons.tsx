import { FiShoppingBag, FiZap } from "react-icons/fi";
import { Spinner } from "./Spinner";

type Props = {
  onBuy?: () => void;
  onAddToCart?: () => void;
  disabled?: boolean;
  buying?: boolean;
  adding?: boolean;
  actionsDisabled?: boolean;
  addLabel?: string;
  buyLabel?: string;
  size?: "card" | "detail" | "compact";
};

export function PurchaseButtons({
  onBuy,
  onAddToCart,
  disabled = false,
  buying = false,
  adding = false,
  actionsDisabled = false,
  addLabel = "Add to cart",
  buyLabel = "Buy now",
  size = "card",
}: Props) {
  const buttonClass = `store-purchase-button store-purchase-button--${size}`;

  return (
    <div className={`store-purchase-actions store-purchase-actions--${size}`}>
      {onAddToCart && (
        <button type="button" onClick={onAddToCart} disabled={disabled || actionsDisabled || adding || buying} className={`${buttonClass} store-purchase-button--cart`}>
          {adding ? <Spinner size={13} label="Adding…" /> : <><FiShoppingBag size={size === "compact" ? 11 : 15} /> {addLabel}</>}
        </button>
      )}
      {onBuy && (
        <button type="button" onClick={onBuy} disabled={disabled || actionsDisabled || buying || adding} className={`${buttonClass} store-purchase-button--buy`}>
          {buying ? <Spinner size={13} label="Redirecting…" /> : <><FiZap size={size === "compact" ? 11 : 15} /> {buyLabel}</>}
        </button>
      )}
    </div>
  );
}
