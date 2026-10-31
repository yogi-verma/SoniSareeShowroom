"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  FiArrowRight,
  FiCheck,
  FiCheckCircle,
  FiEdit2,
  FiHome,
  FiLogIn,
  FiLogOut,
  FiMail,
  FiMinus,
  FiMapPin,
  FiPhone,
  FiPackage,
  FiPlus,
  FiRefreshCw,
  FiShoppingBag,
  FiShield,
  FiTrash2,
  FiUser,
  FiX,
  FiLoader
} from "react-icons/fi";
import Header from "../Header/Header";
import { type AuthUser, useAuth } from "../Auth/AuthProvider";
import { clearCart as clearCartRequest, getCart, removeCartItem as removeCartItemRequest, updateCartItem as updateCartItemRequest, type Cart, type CartItem } from "../../lib/cartApi";
import { openCartCheckout } from "../../lib/paymentApi";
import { getMyOrder, getMyOrders, type OrderDetail, type OrderSummary } from "../../lib/ordersApi";

type UserAddress = {
  _id: string;
  label: string;
  flatHouseNo: string;
  areaStreetSectorVillage: string;
  landmark: string;
  pincode: string;
  townCity: string;
  state: string;
  isDefault: boolean;
};
type ProfileData = AuthUser & {
  phoneNumber: string;
  addresses: UserAddress[];
};
type AddressDraft = Omit<UserAddress, "_id">;
type ProfileSection = "personal" | "addresses" | "orders" | "cart";
type ApiError = { message?: string };

const authApiUrl = (process.env.NEXT_PUBLIC_AUTH_API_URL || "http://localhost:5000").replace(/\/+$/, "");
const emptyCart: Cart = { items: [], distinctItems: 0, totalItems: 0, subtotal: 0 };

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

const emptyAddress: AddressDraft = {
  label: "Home",
  flatHouseNo: "",
  areaStreetSectorVillage: "",
  landmark: "",
  pincode: "",
  townCity: "",
  state: "",
  isDefault: false,
};

const addressFields: { name: keyof AddressDraft; label: string; required?: boolean; wide?: boolean; placeholder?: string }[] = [
  { name: "label", label: "Address label", placeholder: "Home, Work, etc." },
  { name: "flatHouseNo", label: "Flat / House no.", placeholder: "e.g. 12B, second floor" },
  { name: "areaStreetSectorVillage", label: "Area / Street / Sector / Village", required: true, wide: true },
  { name: "landmark", label: "Landmark", placeholder: "Near a well-known place" },
  { name: "pincode", label: "Pincode", required: true, placeholder: "6-digit pincode" },
  { name: "townCity", label: "Town / City", required: true },
  { name: "state", label: "State", required: true },
];

async function requestApi<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  const response = await fetch(`${authApiUrl}/api/users/me${path}`, {
    ...init,
    headers,
    credentials: "include",
    cache: "no-store",
  });
  const result = (await response.json().catch(() => ({}))) as T & ApiError;
  if (!response.ok) throw new Error(result.message || "We couldn’t complete that request. Please try again.");
  return result;
}

function normalizeEmail(email: string) {
  let normalized = email.trim();
  try {
    normalized = decodeURIComponent(normalized);
  } catch {
    // Keep the original value when a route contains a malformed escape sequence.
  }
  return normalized.trim().toLowerCase();
}

function Avatar({ user }: { user: AuthUser }) {
  return user.picture ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={user.picture} alt="" className="h-20 w-20 shrink-0 rounded-full border-4 border-white/70 object-cover shadow-md" />
  ) : (
    <span className="grid h-20 w-20 shrink-0 place-items-center rounded-full border-4 border-white/70 bg-[#eadce8] font-serif text-3xl text-[#684768] shadow-md" aria-hidden="true">
      {user.name.charAt(0).toUpperCase()}
    </span>
  );
}

function LoadingProfile() {
  return (
    <main className="min-h-screen bg-[#faf7f2] text-[#302531]">
      <Header />
      <div className="h-[300px] bg-gradient-to-br from-[#40233e] via-[#30172f] to-[#211821]" />
      <section className="mx-auto -mt-16 max-w-5xl px-5 pb-16 sm:px-8">
        <div className="grid animate-pulse gap-5 rounded-2xl border border-[#eadfd8] bg-[#fffdfa] p-6 shadow-xl md:grid-cols-[280px_1fr] md:p-8">
          <div className="h-52 rounded-xl bg-[#eee6e0]" />
          <div className="space-y-4 py-2"><div className="h-5 w-40 rounded bg-[#eee6e0]" /><div className="h-12 rounded bg-[#f3efeb]" /><div className="h-12 rounded bg-[#f3efeb]" /></div>
        </div>
      </section>
    </main>
  );
}

function addressSummary(address: UserAddress) {
  return [
    address.flatHouseNo,
    address.areaStreetSectorVillage,
    address.landmark ? `Near ${address.landmark}` : "",
    [address.townCity, address.state, address.pincode].filter(Boolean).join(", "),
  ].filter(Boolean).join(", ");
}

export default function Profile({ email }: { email: string }) {
  const router = useRouter();
  const { user, isLoading: isAuthLoading, openSignIn, requestLogout } = useAuth();
  const isOwnProfile = Boolean(user && normalizeEmail(user.email) === normalizeEmail(email));

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [notice, setNotice] = useState("");
  const [activeSection, setActiveSection] = useState<ProfileSection>("personal");

  const [phoneDraft, setPhoneDraft] = useState("");
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [isSavingPhone, setIsSavingPhone] = useState(false);
  const [phoneError, setPhoneError] = useState("");

  const [isAddressEditorOpen, setIsAddressEditorOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressDraft, setAddressDraft] = useState<AddressDraft>(emptyAddress);
  const [addressError, setAddressError] = useState("");
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<UserAddress | null>(null);
  const [isDeletingAddress, setIsDeletingAddress] = useState(false);
  const [cart, setCart] = useState<Cart>(emptyCart);
  const [isCartLoading, setIsCartLoading] = useState(true);
  const [cartError, setCartError] = useState("");
  const [updatingCartProductId, setUpdatingCartProductId] = useState<string | null>(null);
  const [cartItemToRemove, setCartItemToRemove] = useState<CartItem | null>(null);
  const [isRemovingCartItem, setIsRemovingCartItem] = useState(false);
  const [isClearCartConfirmationOpen, setIsClearCartConfirmationOpen] = useState(false);
  const [isClearingCart, setIsClearingCart] = useState(false);
  const [isStartingCartCheckout, setIsStartingCartCheckout] = useState(false);
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [isOrdersLoading, setIsOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);
  const [isOrderDetailLoading, setIsOrderDetailLoading] = useState(false);
  const [orderDetailError, setOrderDetailError] = useState("");

  const loadProfile = useCallback(async (showLoading = true) => {
    if (showLoading) setIsProfileLoading(true);
    setLoadError("");
    try {
      const result = await requestApi<{ user: ProfileData }>("");
      setProfile(result.user);
      setPhoneDraft(result.user.phoneNumber || "");
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Could not load your profile.");
    } finally {
      setIsProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthLoading || !isOwnProfile) return;
    let isActive = true;
    requestApi<{ user: ProfileData }>("")
      .then(({ user: currentProfile }) => {
        if (!isActive) return;
        setProfile(currentProfile);
        setPhoneDraft(currentProfile.phoneNumber || "");
        setLoadError("");
        setIsProfileLoading(false);
      })
      .catch((error: unknown) => {
        if (!isActive) return;
        setLoadError(error instanceof Error ? error.message : "Could not load your profile.");
        setIsProfileLoading(false);
      });
    return () => {
      isActive = false;
    };
  }, [isAuthLoading, isOwnProfile, user?.id]);

  const loggedInEmail = user?.email;
  const refreshOrders = useCallback(async () => {
    if (!loggedInEmail) return;
    setIsOrdersLoading(true);
    setOrdersError("");
    try {
      const result = await getMyOrders(loggedInEmail);
      setOrders(result.orders);
    } catch (error) {
      setOrdersError(error instanceof Error ? error.message : "Could not load your orders.");
    } finally {
      setIsOrdersLoading(false);
    }
  }, [loggedInEmail]);

  useEffect(() => {
    if (!isOwnProfile) return;
    const refreshAfterPayment = () => void refreshOrders();
    window.addEventListener("soni:order-updated", refreshAfterPayment);
    return () => window.removeEventListener("soni:order-updated", refreshAfterPayment);
  }, [isOwnProfile, refreshOrders]);

  async function openOrderDetails(orderId: string) {
    if (!user?.email) return;
    setIsOrderDetailLoading(true);
    setOrderDetailError("");
    setSelectedOrder(null);
    try {
      const result = await getMyOrder(user.email, orderId);
      setSelectedOrder(result.order);
    } catch (error) {
      setOrderDetailError(error instanceof Error ? error.message : "Could not load this order.");
    } finally {
      setIsOrderDetailLoading(false);
    }
  }

  useEffect(() => {
    if (isAuthLoading || !isOwnProfile) return;
    let isActive = true;
    const refreshCart = () => {
      getCart()
        .then((currentCart) => {
          if (!isActive) return;
          setCart(currentCart);
          setCartError("");
        })
        .catch((error: unknown) => {
          if (!isActive) return;
          setCartError(error instanceof Error ? error.message : "Could not load your cart.");
        })
        .finally(() => {
          if (isActive) setIsCartLoading(false);
        });
    };
    refreshCart();
    window.addEventListener("soni:cart-updated", refreshCart);
    return () => {
      isActive = false;
      window.removeEventListener("soni:cart-updated", refreshCart);
    };
  }, [isAuthLoading, isOwnProfile, user?.id]);

  useEffect(() => {
    if (!notice) return;
    const timeoutId = window.setTimeout(() => setNotice(""), 3200);
    return () => window.clearTimeout(timeoutId);
  }, [notice]);

  useEffect(() => {
    const syncSectionFromHash = () => {
      if (window.location.hash === "#cart") setActiveSection("cart");
    };
    syncSectionFromHash();
    window.addEventListener("hashchange", syncSectionFromHash);
    return () => window.removeEventListener("hashchange", syncSectionFromHash);
  }, []);

  async function savePhone(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPhoneError("");
    setIsSavingPhone(true);
    try {
      const result = await requestApi<{ phoneNumber: string }>("", {
        method: "PATCH",
        body: JSON.stringify({ phoneNumber: phoneDraft }),
      });
      setProfile((current) => current ? { ...current, phoneNumber: result.phoneNumber } : current);
      setPhoneDraft(result.phoneNumber);
      setIsEditingPhone(false);
      setNotice("Phone number updated.");
    } catch (error) {
      setPhoneError(error instanceof Error ? error.message : "Could not update your phone number.");
    } finally {
      setIsSavingPhone(false);
    }
  }

  function beginCreateAddress() {
    setEditingAddressId(null);
    setAddressDraft({ ...emptyAddress, isDefault: !profile?.addresses.length });
    setAddressError("");
    setIsAddressEditorOpen(true);
  }

  function beginEditAddress(address: UserAddress) {
    setEditingAddressId(address._id);
    setAddressDraft({
      label: address.label || "Home",
      flatHouseNo: address.flatHouseNo || "",
      areaStreetSectorVillage: address.areaStreetSectorVillage || "",
      landmark: address.landmark || "",
      pincode: address.pincode || "",
      townCity: address.townCity || "",
      state: address.state || "",
      isDefault: address.isDefault,
    });
    setAddressError("");
    setIsAddressEditorOpen(true);
  }

  async function saveAddress(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAddressError("");
    setIsSavingAddress(true);
    const payload = {
      ...addressDraft,
      label: addressDraft.label.trim() || "Home",
      flatHouseNo: addressDraft.flatHouseNo.trim(),
      areaStreetSectorVillage: addressDraft.areaStreetSectorVillage.trim(),
      landmark: addressDraft.landmark.trim(),
      pincode: addressDraft.pincode.trim(),
      townCity: addressDraft.townCity.trim(),
      state: addressDraft.state.trim(),
    };

    try {
      const path = editingAddressId ? `/addresses/${encodeURIComponent(editingAddressId)}` : "/addresses";
      const result = await requestApi<{ address: UserAddress }>(path, {
        method: editingAddressId ? "PATCH" : "POST",
        body: JSON.stringify(payload),
      });
      await loadProfile(false);
      setIsAddressEditorOpen(false);
      setNotice(editingAddressId ? "Address updated." : "Address saved.");
      if (!result.address) setAddressError("The address was saved, but the updated list could not be displayed.");
    } catch (error) {
      setAddressError(error instanceof Error ? error.message : "Could not save this address.");
    } finally {
      setIsSavingAddress(false);
    }
  }

  async function setDefaultAddress(addressId: string) {
    setLoadError("");
    try {
      await requestApi(`/addresses/${encodeURIComponent(addressId)}`, {
        method: "PATCH",
        body: JSON.stringify({ isDefault: true }),
      });
      await loadProfile(false);
      setNotice("Default delivery address updated.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not update the default address.");
    }
  }

  async function deleteAddress() {
    if (!pendingDelete) return;
    setIsDeletingAddress(true);
    try {
      await requestApi(`/addresses/${encodeURIComponent(pendingDelete._id)}`, { method: "DELETE" });
      await loadProfile(false);
      setPendingDelete(null);
      setNotice("Address removed.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not delete this address.");
    } finally {
      setIsDeletingAddress(false);
    }
  }

  async function changeCartQuantity(item: CartItem, quantity: number) {
    if (quantity < 1 || quantity > 99) return;
    setCartError("");
    setUpdatingCartProductId(item.productId);
    try {
      const result = await updateCartItemRequest(item.productId, quantity);
      setCart(result.cart);
      setNotice("Cart quantity updated.");
    } catch (error) {
      setCartError(error instanceof Error ? error.message : "Could not update this cart item.");
    } finally {
      setUpdatingCartProductId(null);
    }
  }

  async function checkoutCart() {
    if (!user) {
      openSignIn();
      return;
    }
    if (!cart.items.length || cart.items.some((item) => !item.isAvailable)) return;

    setIsStartingCartCheckout(true);
    try {
      await openCartCheckout({ name: user.name, email: user.email }, {
        onVerified: (status) => setNotice(status === "paid" ? "Payment successful. Your cart order is confirmed." : "Payment authorized and awaiting confirmation."),
        onFailure: setNotice,
        onDismiss: () => setNotice("Checkout was closed. No payment was confirmed."),
      });
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not start checkout.");
    } finally {
      setIsStartingCartCheckout(false);
    }
  }

  async function removeCartItem() {
    if (!cartItemToRemove) return;
    setIsRemovingCartItem(true);
    setCartError("");
    try {
      const result = await removeCartItemRequest(cartItemToRemove.productId);
      setCart(result.cart);
      setCartItemToRemove(null);
      setNotice("Item removed from your cart.");
    } catch (error) {
      setCartError(error instanceof Error ? error.message : "Could not remove this item.");
    } finally {
      setIsRemovingCartItem(false);
    }
  }

  async function confirmClearCart() {
    setIsClearingCart(true);
    setCartError("");
    try {
      const result = await clearCartRequest();
      setCart(result.cart);
      setIsClearCartConfirmationOpen(false);
      setNotice("Your cart has been cleared.");
    } catch (error) {
      setCartError(error instanceof Error ? error.message : "Could not clear your cart.");
    } finally {
      setIsClearingCart(false);
    }
  }

  if (isAuthLoading || (isOwnProfile && isProfileLoading)) return <LoadingProfile />;

  return (
    <main className="min-h-screen bg-[#faf7f2] text-[#302531]">
      <Header />
      <section className="relative overflow-hidden bg-gradient-to-br from-[#40233e] via-[#30172f] to-[#211821] pb-25 pt-25 text-white sm:pb-25 sm:pt-25">
        <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-32 h-[380px] w-[380px] rounded-full border border-white/10" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-5 -top-16 h-[250px] w-[250px] rounded-full border border-white/10" />
      </section>

      <section className="relative mx-auto -mt-16 max-w-6xl px-4 pb-16 sm:px-8 sm:pb-20">
        {user && isOwnProfile && profile ? (
          <div className="grid items-start gap-5 lg:grid-cols-[290px_minmax(0,1fr)]">
            <aside className="rounded-2xl border border-[#eadfd8] bg-[#fffdfa] p-5 shadow-[0_16px_44px_rgba(43,27,38,0.11)] sm:p-7 lg:sticky lg:top-24">
              <div className="flex flex-col items-center text-center">
                <Avatar user={user} />
                <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#edf4ee] px-3 py-1 text-[9px] font-semibold tracking-[0.12em] text-[#54745f]">
                  <FiCheckCircle size={12} /> ACCOUNT ACTIVE
                </span>
                <h2 className="mt-3 max-w-full truncate font-serif text-2xl">{user.name}</h2>
                <p className="mt-1 max-w-full truncate text-xs text-[#777078]">{user.email}</p>
              </div>
              <nav aria-label="Profile sections" className="mt-5 space-y-1.5">
                {([
                  { id: "personal", label: "Personal Details", icon: FiUser },
                  { id: "addresses", label: "Your Addresses", icon: FiHome },
                  { id: "orders", label: "Your Orders", icon: FiPackage, count: orders.length },
                  { id: "cart", label: "Your Cart", icon: FiShoppingBag, count: cart.totalItems },
                ] as const).map(({ id, label, icon: Icon, ...item }) => (
                  <button
                    key={id}
                    type="button"
                    aria-current={activeSection === id ? "page" : undefined}
                    onClick={() => { setActiveSection(id); if (id === "orders") void refreshOrders(); }}
                    className={`flex min-h-11 w-full items-center gap-3 rounded-lg px-3.5 text-left text-xs font-semibold transition ${activeSection === id ? "bg-[#30172f] text-white shadow-sm" : "text-[#6f626f] hover:bg-[#f6eef4] hover:text-[#30172f]"}`}
                  >
                    <Icon size={16} />
                    <span className="flex-1">{label}</span>
                    {"count" in item && item.count > 0 && <span className={`min-w-6 rounded-full px-2 py-1 text-center text-[9px] ${activeSection === id ? "bg-white/15 text-white" : "bg-[#f0e6ef] text-[#684768]"}`}>{item.count}</span>}
                  </button>
                ))}
              </nav>
              <button
                type="button"
                onClick={requestLogout}
                className="mt-5 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-[#e4d9e2] text-xs font-semibold text-[#684768] transition hover:bg-[#f6eef4]"
              >
                <FiLogOut size={14} /> Log out
              </button>
            </aside>

            <div className="space-y-5">
              {loadError && (
                <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#efd5d3] bg-white px-4 py-3 text-xs text-[#9b3935]">
                  <span>{loadError}</span>
                  <button type="button" onClick={() => void loadProfile()} className="inline-flex items-center gap-1.5 font-semibold"><FiRefreshCw size={13} /> Retry</button>
                </div>
              )}

              {activeSection === "personal" && <section className="rounded-2xl border border-[#eadfd8] bg-[#fffdfa] p-5 shadow-[0_16px_44px_rgba(43,27,38,0.08)] sm:p-7">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#eee7e1] pb-5">
                  <div>
                    <span className="text-[9px] font-semibold tracking-[0.22em] text-[#986d8f]">ACCOUNT INFORMATION</span>
                    <h2 className="mt-1.5 font-serif text-2xl">Personal details</h2>
                    <p className="mt-1 text-xs text-[#817681]">Your name and email are connected to Google.</p>
                  </div>
                  <span className="rounded-full border border-[#e8dce7] bg-[#fbf7fa] px-3 py-1.5 text-[9px] font-semibold tracking-wide text-[#684768]">CUSTOMER ACCOUNT</span>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="flex min-w-0 items-center gap-3 rounded-xl border border-[#eee7e1] bg-white p-4">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#f6eef4] text-[#684768]"><FiUser size={17} /></span>
                    <div className="min-w-0"><p className="text-[9px] font-semibold tracking-[0.15em] text-[#918792]">FULL NAME</p><p className="mt-1 truncate text-sm font-medium">{user.name}</p></div>
                  </div>
                  <div className="flex min-w-0 items-center gap-3 rounded-xl border border-[#eee7e1] bg-white p-4">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#f6eef4] text-[#684768]"><FiMail size={17} /></span>
                    <div className="min-w-0"><p className="text-[9px] font-semibold tracking-[0.15em] text-[#918792]">EMAIL ADDRESS</p><p className="mt-1 break-all text-sm font-medium">{user.email}</p></div>
                  </div>
                </div>

                <div className="mt-3 rounded-xl border border-[#eee7e1] bg-white p-4 sm:p-5">
                  {isEditingPhone ? (
                    <form onSubmit={savePhone} className="space-y-3">
                      <label htmlFor="profile-phone" className="block text-[9px] font-semibold tracking-[0.15em] text-[#918792]">PHONE NUMBER</label>
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <input
                          id="profile-phone"
                          type="tel"
                          autoComplete="tel"
                          value={phoneDraft}
                          onChange={(event) => setPhoneDraft(event.target.value)}
                          placeholder="+91 98765 43210"
                          className="min-h-11 min-w-0 flex-1 rounded-lg border border-[#d9cbd4] bg-[#fffdfa] px-3 text-sm outline-none transition focus:border-[#986d8f] focus:ring-2 focus:ring-[#986d8f]/15"
                        />
                        <div className="flex gap-2">
                          <button type="submit" disabled={isSavingPhone} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-[#30172f] px-4 text-xs font-semibold text-white transition hover:bg-[#593153] disabled:opacity-60 sm:flex-none">
                            {isSavingPhone ? "Saving…" : <><FiCheck size={15} /> Save</>}
                          </button>
                          <button type="button" onClick={() => { setPhoneDraft(profile.phoneNumber || ""); setPhoneError(""); setIsEditingPhone(false); }} className="min-h-11 rounded-lg border border-[#d9cbd4] px-4 text-xs font-semibold text-[#684768] hover:bg-[#f8f3f6]">Cancel</button>
                        </div>
                      </div>
                      {phoneError && <p role="alert" className="text-xs text-[#a13d39]">{phoneError}</p>}
                      <p className="text-[10px] text-[#918792]">Use an international format, for example +91 98765 43210.</p>
                    </form>
                  ) : (
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#f6eef4] text-[#684768]"><FiPhone size={17} /></span>
                        <div className="min-w-0"><p className="text-[9px] font-semibold tracking-[0.15em] text-[#918792]">PHONE NUMBER</p><p className="mt-1 truncate text-sm font-medium">{profile.phoneNumber || "Add a phone number"}</p></div>
                      </div>
                      <button type="button" onClick={() => setIsEditingPhone(true)} className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-[#e4d9e2] px-3 text-[11px] font-semibold text-[#684768] transition hover:bg-[#f6eef4]">
                        <FiEdit2 size={13} /> {profile.phoneNumber ? "Edit" : "Add phone"}
                      </button>
                    </div>
                  )}
                </div>
              </section>}

              {activeSection === "addresses" && <section className="rounded-2xl border border-[#eadfd8] bg-[#fffdfa] p-5 shadow-[0_16px_44px_rgba(43,27,38,0.08)] sm:p-7">
                <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#eee7e1] pb-5">
                  <div>
                    <span className="text-[9px] font-semibold tracking-[0.22em] text-[#986d8f]">DELIVERY INFORMATION</span>
                    <h2 className="mt-1.5 font-serif text-2xl">Saved addresses</h2>
                    <p className="mt-1 text-xs text-[#817681]">Keep your delivery details ready for your next order.</p>
                  </div>
                  <button type="button" onClick={beginCreateAddress} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#30172f] px-4 text-xs font-semibold text-white transition hover:bg-[#593153]">
                    <FiPlus size={15} /> Add address
                  </button>
                </div>

                {profile.addresses.length ? (
                  <div className="mt-5 grid gap-3 md:grid-cols-2">
                    {profile.addresses.map((address) => (
                      <article key={address._id} className={`rounded-xl border p-4 transition ${address.isDefault ? "border-[#c8aec5] bg-[#fcf8fb]" : "border-[#eee7e1] bg-white"}`}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-2.5">
                            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#f6eef4] text-[#684768]"><FiHome size={15} /></span>
                            <div className="min-w-0">
                              <h3 className="truncate text-sm font-semibold">{address.label || "Address"}</h3>
                              {address.isDefault && <span className="mt-1 inline-flex rounded-full bg-[#edf4ee] px-2 py-0.5 text-[8px] font-semibold tracking-wide text-[#54745f]">DEFAULT</span>}
                            </div>
                          </div>
                        </div>
                        <p className="mt-3 min-h-[60px] text-xs leading-5 text-[#716a73]">{addressSummary(address)}</p>
                        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#eee7e1] pt-3">
                          <div className="flex gap-1.5">
                            {!address.isDefault && <button type="button" onClick={() => void setDefaultAddress(address._id)} className="rounded-md px-2 py-1.5 text-[10px] font-semibold text-[#684768] hover:bg-[#f6eef4]">Make default</button>}
                            <button type="button" onClick={() => beginEditAddress(address)} aria-label={`Edit ${address.label} address`} className="grid h-8 w-8 place-items-center rounded-md text-[#684768] hover:bg-[#f6eef4]"><FiEdit2 size={14} /></button>
                          </div>
                          <button type="button" onClick={() => setPendingDelete(address)} aria-label={`Delete ${address.label} address`} className="grid h-8 w-8 place-items-center rounded-md text-[#9b504d] hover:bg-[#fbefed]"><FiTrash2 size={14} /></button>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="mt-5 rounded-xl border border-dashed border-[#d9cbd4] bg-white px-5 py-10 text-center">
                    <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#f6eef4] text-[#684768]"><FiMapPin size={19} /></span>
                    <h3 className="mt-3 font-serif text-xl">No saved addresses yet</h3>
                    <p className="mt-1 text-xs text-[#817681]">Add an address so your delivery details are ready when you shop.</p>
                    <button type="button" onClick={beginCreateAddress} className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#cbb8c8] bg-white px-4 text-xs font-semibold text-[#684768] transition hover:bg-[#f6eef4]"><FiPlus size={14} /> Add your first address</button>
                  </div>
                )}
              </section>}

              {activeSection === "orders" && <section id="orders" className="scroll-mt-24 rounded-2xl border border-[#eadfd8] bg-[#fffdfa] p-5 shadow-[0_16px_44px_rgba(43,27,38,0.08)] sm:p-7">
                <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#eee7e1] pb-5">
                  <div>
                    <span className="text-[9px] font-semibold tracking-[0.22em] text-[#986d8f]">YOUR PURCHASES</span>
                    <h2 className="mt-1.5 font-serif text-2xl">Your orders</h2>
                    <p className="mt-1 text-xs text-[#817681]">{orders.length} paid {orders.length === 1 ? "order" : "orders"}</p>
                  </div>
                  {!selectedOrder && <button type="button" onClick={() => void refreshOrders()} disabled={isOrdersLoading} className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-[#d9cbd4] px-3 text-[10px] font-semibold text-[#684768] transition hover:bg-[#f6eef4] disabled:opacity-50"><FiRefreshCw size={13} className={isOrdersLoading ? "animate-spin" : ""} /> Refresh</button>}
                </div>

                {ordersError && <div role="alert" className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#efd5d3] bg-[#fff9f8] px-3 py-2.5 text-xs text-[#9b3935]"><span>{ordersError}</span><button type="button" onClick={() => void refreshOrders()} className="font-semibold">Try again</button></div>}

                {isOrdersLoading ? (
                  <div className="mt-5 space-y-3">{[0, 1].map((item) => <div key={item} className="h-24 animate-pulse rounded-xl bg-[#f0e9e4]" />)}</div>
                ) : selectedOrder ? (
                  <div className="mt-5">
                    <button type="button" onClick={() => { setSelectedOrder(null); setOrderDetailError(""); }} className="mb-4 inline-flex min-h-9 items-center gap-2 rounded-lg px-2 text-xs font-semibold text-[#684768] transition hover:bg-[#f6eef4]"><FiArrowRight className="rotate-180" size={14} /> Back to all orders</button>
                    <article className="overflow-hidden rounded-xl border border-[#eee7e1] bg-white">
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eee7e1] bg-[#fcf8fb] px-4 py-3 sm:px-5">
                        <div><p className="text-[9px] font-semibold tracking-[0.16em] text-[#986d8f]">ORDER DETAILS</p><p className="mt-1 text-[10px] text-[#817681]">Placed {new Date(selectedOrder.placedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p></div>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#edf4ee] px-3 py-1.5 text-[9px] font-semibold text-[#54745f]"><FiCheckCircle size={12} /> PAYMENT SUCCESSFUL</span>
                      </div>
                      <div className="grid gap-5 p-4 sm:p-5 md:grid-cols-[minmax(0,1fr)_250px]">
                        <div className="space-y-3">
                          {selectedOrder.items.map((item) => (
                            <div key={item.productId} className="flex gap-3 rounded-lg border border-[#eee7e1] p-3">
                              <div className="h-20 w-16 shrink-0 overflow-hidden rounded-md bg-[#f0e9e4]">{item.photoUrl ? <Image src={item.photoUrl} alt={item.name} width={80} height={100} unoptimized className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-[#9a778f]"><FiPackage size={18} /></div>}</div>
                              <div className="min-w-0 flex-1 py-0.5">
                                <p className="text-[8px] font-semibold uppercase tracking-[0.14em] text-[#986d8f]">{item.productType} · {item.category}</p>
                                <h3 className="mt-1 font-serif text-base leading-5 text-[#302531]">{item.name}</h3>
                                <p className="mt-1 text-[10px] text-[#777078]">{formatPrice(item.unitPrice)} each · Qty {item.quantity}</p>
                                <p className="mt-1 text-xs font-semibold text-[#30172f]">{formatPrice(item.lineTotal)}</p>
                              </div>
                            </div>
                          ))}
                          <p className="text-right text-sm font-semibold text-[#30172f]">Total paid: {formatPrice(selectedOrder.totalAmount)}</p>
                        </div>
                        <dl className="space-y-3 rounded-lg bg-[#faf7f2] p-4 text-[10px]">
                          <div><dt className="text-[#918792]">Order reference</dt><dd className="mt-0.5 break-all font-medium text-[#463847]">{selectedOrder.receipt}</dd></div>
                          <div><dt className="text-[#918792]">Payment method</dt><dd className="mt-0.5 font-medium capitalize text-[#463847]">{selectedOrder.paymentMethod || "Razorpay"}</dd></div>
                          <div><dt className="text-[#918792]">Payment ID</dt><dd className="mt-0.5 break-all font-medium text-[#463847]">{selectedOrder.razorpayPaymentId || "—"}</dd></div>
                          <div><dt className="text-[#918792]">Paid by</dt><dd className="mt-0.5 break-all font-medium text-[#463847]">{selectedOrder.customerEmail || user.email}</dd></div>
                        </dl>
                      </div>
                    </article>
                  </div>
                ) : isOrderDetailLoading ? (
                  <div className="mt-5 h-56 animate-pulse rounded-xl bg-[#f0e9e4]" />
                ) : orderDetailError ? (
                  <p role="alert" className="mt-5 rounded-lg bg-[#fff6f5] px-4 py-3 text-xs text-[#9b3935]">{orderDetailError}</p>
                ) : orders.length ? (
                  <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
                    {orders.map((order) => (
                      <button key={order.id} type="button" onClick={() => void openOrderDetails(order.id)} className="group flex w-full items-center gap-2.5 rounded-lg border border-[#eee7e1] bg-white p-2.5 text-left transition hover:border-[#cbb8c8] hover:bg-[#fffdfa] hover:shadow-sm">
                        <div className="h-16 w-12 shrink-0 overflow-hidden rounded-md bg-[#f0e9e4]">{order.productPhotoUrl ? <Image src={order.productPhotoUrl} alt="" width={64} height={84} unoptimized className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-[#9a778f]"><FiPackage size={17} /></div>}</div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[7px] font-semibold uppercase tracking-[0.12em] text-[#986d8f]">{order.itemCount} {order.itemCount === 1 ? "item" : "items"}</p>
                          <h3 className="mt-0.5 line-clamp-1 font-serif text-sm text-[#302531]">{order.productName}</h3>
                          <p className="mt-1 text-[9px] text-[#817681]">{new Date(order.placedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} · Qty {order.quantity}</p>
                          <span className="mt-1 inline-flex items-center gap-1 text-[8px] font-semibold text-[#54745f]">Paid <FiArrowRight size={11} className="transition-transform group-hover:translate-x-0.5" /></span>
                        </div>
                        <p className="shrink-0 self-start text-[10px] font-semibold text-[#30172f]">{formatPrice(order.totalAmount)}</p>
                      </button>
                    ))}
                  </div>
                ) : !ordersError && (
                  <div className="mt-5 rounded-xl border border-dashed border-[#d9cbd4] bg-white px-5 py-12 text-center">
                    <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#f6eef4] text-[#684768]"><FiPackage size={19} /></span>
                    <h3 className="mt-3 font-serif text-xl">Your orders will appear here</h3>
                    <p className="mt-1 text-xs text-[#817681]">Orders appear after payment is successfully confirmed.</p>
                    <button type="button" onClick={() => router.push("/#shop")} className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#cbb8c8] px-4 text-xs font-semibold text-[#684768] transition hover:bg-[#f6eef4]"><FiArrowRight size={14} /> Explore the collection</button>
                  </div>
                )}
              </section>}

              {activeSection === "cart" && <section id="cart" className="scroll-mt-24 rounded-2xl border border-[#eadfd8] bg-[#fffdfa] p-5 shadow-[0_16px_44px_rgba(43,27,38,0.08)] sm:p-7">
                <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#eee7e1] pb-5">
                  <div>
                    <span className="text-[9px] font-semibold tracking-[0.22em] text-[#986d8f]">YOUR SELECTION</span>
                    <h2 className="mt-1.5 font-serif text-2xl">Shopping cart</h2>
                    <p className="mt-1 text-xs text-[#817681]">{cart.totalItems} {cart.totalItems === 1 ? "item" : "items"} across {cart.distinctItems} {cart.distinctItems === 1 ? "product" : "products"}</p>
                  </div>
                  {cart.items.length > 0 && (
                    <button type="button" onClick={() => setIsClearCartConfirmationOpen(true)} className="min-h-9 rounded-lg px-3 text-[11px] font-semibold text-[#9b504d] transition hover:bg-[#fbefed]">Clear cart</button>
                  )}
                </div>

                {cartError && (
                  <div role="alert" className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#efd5d3] bg-[#fff9f8] px-3 py-2.5 text-xs text-[#9b3935]">
                    <span>{cartError}</span>
                    <button type="button" onClick={() => { setIsCartLoading(true); void getCart().then((currentCart) => { setCart(currentCart); setCartError(""); }).catch((error: unknown) => setCartError(error instanceof Error ? error.message : "Could not load your cart.")).finally(() => setIsCartLoading(false)); }} className="inline-flex items-center gap-1.5 font-semibold"><FiRefreshCw size={13} /> Retry</button>
                  </div>
                )}

                {isCartLoading ? (
                  <div className="mt-5 grid animate-pulse gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
                    <div className="h-28 rounded-xl bg-[#f0e9e4]" />
                    <div className="h-40 rounded-xl bg-[#f0e9e4]" />
                  </div>
                ) : cart.items.length ? (
                  <div className="mt-5 grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_235px]">
                    <div className="space-y-3">
                      {cart.items.map((item) => (
                        <article key={item.productId} className="rounded-xl border border-[#eee7e1] bg-white p-3.5 sm:p-4">
                          <div className="flex gap-3 sm:gap-4">
                            <div className="h-[104px] w-[82px] shrink-0 overflow-hidden rounded-lg bg-[#f0e9e4] sm:h-[118px] sm:w-[94px]">
                              {item.photoUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={item.photoUrl} alt={item.name} className="h-full w-full object-cover" />
                              ) : <div className="grid h-full place-items-center text-[#9a778f]"><FiHome size={22} /></div>}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <p className="text-[8px] font-semibold uppercase tracking-[0.15em] text-[#986d8f]">{item.category}</p>
                                  <h3 className="mt-1 line-clamp-2 font-serif text-base leading-5 text-[#302531] sm:text-lg">{item.name}</h3>
                                  <p className="mt-1.5 text-xs text-[#777078]">{formatPrice(item.unitPrice)} each</p>
                                </div>
                                <p className="shrink-0 text-sm font-semibold text-[#30172f]">{formatPrice(item.lineTotal)}</p>
                              </div>

                              {!item.isAvailable && (
                                <p className="mt-2 rounded-md bg-[#fff6e9] px-2.5 py-1.5 text-[10px] leading-4 text-[#8b642f]">
                                  {item.availableStock > 0 ? `Only ${item.availableStock} currently available. Adjust the quantity to continue.` : "This product is no longer available. Remove it from your cart."}
                                </p>
                              )}

                              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                                <div className="inline-flex items-center rounded-lg border border-[#dfd3dd] bg-[#fffdfa]">
                                  <button type="button" aria-label={`Decrease ${item.name} quantity`} disabled={item.quantity <= 1 || updatingCartProductId === item.productId} onClick={() => void changeCartQuantity(item, item.quantity - 1)} className="grid h-8 w-9 place-items-center text-[#684768] transition hover:bg-[#f6eef4] disabled:cursor-not-allowed disabled:opacity-40"><FiMinus size={13} /></button>
                                  <span aria-live="polite" className="min-w-8 text-center text-xs font-semibold">{item.quantity}</span>
                                  <button type="button" aria-label={`Increase ${item.name} quantity`} disabled={!item.isAvailable || item.quantity >= item.availableStock || item.quantity >= 99 || updatingCartProductId === item.productId} onClick={() => void changeCartQuantity(item, item.quantity + 1)} className="grid h-8 w-9 place-items-center text-[#684768] transition hover:bg-[#f6eef4] disabled:cursor-not-allowed disabled:opacity-40"><FiPlus size={13} /></button>
                                </div>
                                <button type="button" onClick={() => setCartItemToRemove(item)} className="inline-flex min-h-8 items-center gap-1.5 rounded-md px-2 text-[10px] font-semibold text-[#9b504d] transition hover:bg-[#fbefed]"><FiTrash2 size={13} /> Remove</button>
                              </div>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>

                    <aside className="rounded-xl border border-[#e9dfe8] bg-[#fcf8fb] p-4 sm:p-5 lg:sticky lg:top-5">
                      <p className="text-[9px] font-semibold tracking-[0.18em] text-[#986d8f]">ORDER SUMMARY</p>
                      <div className="mt-4 flex items-center justify-between gap-3 text-xs text-[#716a73]">
                        <span>Subtotal ({cart.totalItems} {cart.totalItems === 1 ? "item" : "items"})</span>
                        <strong className="text-sm text-[#302531]">{formatPrice(cart.subtotal)}</strong>
                      </div>
                      <p className="mt-3 border-t border-[#e9dfe8] pt-3 text-[10px] leading-4 text-[#817681]">Prices and availability are refreshed from the catalog. Cart items are not reserved.</p>
                      {cart.items.some((item) => !item.isAvailable) && <p className="mt-3 text-[10px] leading-4 text-[#9b504d]">Resolve unavailable items before checkout.</p>}
                      <button type="button" disabled={isStartingCartCheckout || cart.items.some((item) => !item.isAvailable)} onClick={() => void checkoutCart()} className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#30172f] px-3 text-xs font-semibold text-white transition hover:bg-[#593153] disabled:cursor-not-allowed disabled:opacity-55">{isStartingCartCheckout ? <><FiLoader size={14} className="animate-spin" /> Redirecting…</> : "Checkout securely"}</button>
                    </aside>
                  </div>
                ) : (
                  <div className="mt-5 rounded-xl border border-dashed border-[#d9cbd4] bg-white px-5 py-10 text-center">
                    <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#f6eef4] text-[#684768]"><FiMapPin size={19} /></span>
                    <h3 className="mt-3 font-serif text-xl">Your cart is waiting for something lovely</h3>
                    <p className="mt-1 text-xs text-[#817681]">Add a saree from the collection and it will appear here.</p>
                    <button type="button" onClick={() => router.push("/#shop")} className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#cbb8c8] bg-white px-4 text-xs font-semibold text-[#684768] transition hover:bg-[#f6eef4]"><FiArrowRight size={14} /> Explore the collection</button>
                  </div>
                )}
              </section>}
            </div>
          </div>
        ) : isOwnProfile && loadError ? (
          <div className="mx-auto max-w-xl rounded-2xl border border-[#eadfd8] bg-[#fffdfa] px-6 py-10 text-center shadow-xl">
            <h2 className="font-serif text-2xl">We couldn’t load your profile</h2>
            <p role="alert" className="mt-2 text-sm text-[#777078]">{loadError}</p>
            <button type="button" onClick={() => void loadProfile()} className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#30172f] px-4 text-xs font-semibold text-white"><FiRefreshCw size={14} /> Try again</button>
          </div>
        ) : (
          <div className="mx-auto max-w-xl rounded-2xl border border-[#eadfd8] bg-[#fffdfa] px-6 py-10 text-center shadow-[0_16px_44px_rgba(43,27,38,0.11)] sm:px-10">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#f3eaf1] text-[#684768]"><FiShield size={22} /></span>
            <h2 className="mt-4 font-serif text-2xl">{user ? "This profile isn’t yours" : "Sign in to view your profile"}</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#777078]">
              {user ? "For your privacy, you can only view the profile connected to your signed-in account." : "Your profile is available after you sign in with the Google account connected to this email."}
            </p>
            {user ? (
              <button type="button" onClick={() => router.replace(`/me/${encodeURIComponent(user.email)}`)} className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#30172f] px-5 text-xs font-semibold text-white transition hover:bg-[#593153]">
                Open my profile <FiArrowRight size={15} />
              </button>
            ) : (
              <button type="button" onClick={openSignIn} className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#30172f] px-5 text-xs font-semibold text-white transition hover:bg-[#593153]">
                <FiLogIn size={15} /> Login / Sign up
              </button>
            )}
          </div>
        )}
      </section>

      {isAddressEditorOpen && (
        <div className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-[#211821]/65 px-4 py-6 backdrop-blur-[3px]">
          <section role="dialog" aria-modal="true" aria-labelledby="address-dialog-title" className="relative my-auto w-full max-w-2xl rounded-2xl border border-[#eadfd8] bg-[#fffdfa] p-5 text-[#302531] shadow-2xl sm:p-7">
            <button type="button" onClick={() => setIsAddressEditorOpen(false)} aria-label="Close address form" className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full text-[#756875] transition hover:bg-[#f3edf1]"><FiX size={17} /></button>
            <span className="text-[9px] font-semibold tracking-[0.22em] text-[#986d8f]">DELIVERY DETAILS</span>
            <h2 id="address-dialog-title" className="mt-1 font-serif text-2xl">{editingAddressId ? "Edit address" : "Add a new address"}</h2>
            <p className="mt-1 text-xs text-[#817681]">Enter the delivery details for this address.</p>
            {addressError && <p role="alert" className="mt-3 rounded-lg bg-[#fbefed] px-3 py-2 text-xs text-[#9b3935]">{addressError}</p>}

            <form onSubmit={saveAddress} className="mt-5">
              <div className="grid gap-3 sm:grid-cols-2">
                {addressFields.map((field) => (
                  <label key={field.name} className={`block ${field.wide ? "sm:col-span-2" : ""}`}>
                    <span className="mb-1.5 block text-[10px] font-semibold text-[#5e515f]">{field.label}{field.required && <span className="ml-1 text-[#a13d39]">*</span>}</span>
                    <input
                      required={field.required}
                      maxLength={field.name === "pincode" ? 6 : undefined}
                      inputMode={field.name === "pincode" ? "numeric" : undefined}
                      pattern={field.name === "pincode" ? "[0-9]{6}" : undefined}
                      value={String(addressDraft[field.name] ?? "")}
                      onChange={(event) => setAddressDraft((current) => ({ ...current, [field.name]: event.target.value }))}
                      placeholder={field.placeholder}
                      className="min-h-11 w-full rounded-lg border border-[#d9cbd4] bg-white px-3 text-sm outline-none transition placeholder:text-[#b0a6af] focus:border-[#986d8f] focus:ring-2 focus:ring-[#986d8f]/15"
                    />
                  </label>
                ))}
              </div>

              <label className="mt-4 flex cursor-pointer items-center gap-2 text-xs text-[#5e515f]">
                <input type="checkbox" checked={addressDraft.isDefault} onChange={(event) => setAddressDraft((current) => ({ ...current, isDefault: event.target.checked }))} className="h-4 w-4 accent-[#684768]" />
                Set as my default delivery address
              </label>
              <div className="mt-6 flex flex-col-reverse justify-end gap-2 border-t border-[#eee7e1] pt-4 sm:flex-row">
                <button type="button" onClick={() => setIsAddressEditorOpen(false)} className="min-h-11 rounded-lg border border-[#d9cbd4] px-5 text-xs font-semibold text-[#684768] transition hover:bg-[#f8f3f6]">Cancel</button>
                <button type="submit" disabled={isSavingAddress} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#30172f] px-5 text-xs font-semibold text-white transition hover:bg-[#593153] disabled:cursor-wait disabled:opacity-60">
                  {isSavingAddress ? <><FiRefreshCw className="animate-spin" size={14} /> Saving…</> : <><FiCheck size={15} /> Save address</>}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {pendingDelete && (
        <div className="fixed inset-0 z-[110] grid place-items-center bg-[#211821]/65 px-5 py-8 backdrop-blur-[3px]">
          <section role="alertdialog" aria-modal="true" aria-labelledby="delete-address-title" className="w-full max-w-[390px] rounded-2xl border border-[#eadfd8] bg-[#fffdfa] px-7 py-7 text-center shadow-2xl">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#fbefed] text-[#9b504d]"><FiTrash2 size={19} /></span>
            <h2 id="delete-address-title" className="mt-4 font-serif text-2xl">Remove this address?</h2>
            <p className="mt-2 text-sm leading-5 text-[#777078]">“{pendingDelete.label}” will be removed from your saved addresses.</p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button type="button" disabled={isDeletingAddress} onClick={() => setPendingDelete(null)} className="min-h-11 rounded-lg border border-[#cbb8c8] text-xs font-semibold text-[#30172f] transition hover:bg-[#f6eef4] disabled:opacity-60">Keep address</button>
              <button type="button" disabled={isDeletingAddress} onClick={() => void deleteAddress()} className="min-h-11 rounded-lg bg-[#8e3936] text-xs font-semibold text-white transition hover:bg-[#762d2b] disabled:opacity-60">{isDeletingAddress ? "Removing…" : "Remove"}</button>
            </div>
          </section>
        </div>
      )}

      {cartItemToRemove && (
        <div className="fixed inset-0 z-[110] grid place-items-center bg-[#211821]/65 px-5 py-8 backdrop-blur-[3px]">
          <section role="alertdialog" aria-modal="true" aria-labelledby="remove-cart-title" className="w-full max-w-[390px] rounded-2xl border border-[#eadfd8] bg-[#fffdfa] px-7 py-7 text-center text-[#302531] shadow-2xl">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#fbefed] text-[#9b504d]"><FiTrash2 size={19} /></span>
            <h2 id="remove-cart-title" className="mt-4 font-serif text-2xl">Remove this item?</h2>
            <p className="mt-2 text-sm leading-5 text-[#777078]">“{cartItemToRemove.name}” will be removed from your shopping cart.</p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button type="button" disabled={isRemovingCartItem} onClick={() => setCartItemToRemove(null)} className="min-h-11 rounded-lg border border-[#cbb8c8] text-xs font-semibold text-[#30172f] transition hover:bg-[#f6eef4] disabled:opacity-60">Keep item</button>
              <button type="button" disabled={isRemovingCartItem} onClick={() => void removeCartItem()} className="min-h-11 rounded-lg bg-[#8e3936] text-xs font-semibold text-white transition hover:bg-[#762d2b] disabled:opacity-60">{isRemovingCartItem ? "Removing…" : "Remove item"}</button>
            </div>
          </section>
        </div>
      )}

      {isClearCartConfirmationOpen && (
        <div className="fixed inset-0 z-[110] grid place-items-center bg-[#211821]/65 px-5 py-8 backdrop-blur-[3px]">
          <section role="alertdialog" aria-modal="true" aria-labelledby="clear-cart-title" className="w-full max-w-[390px] rounded-2xl border border-[#eadfd8] bg-[#fffdfa] px-7 py-7 text-center text-[#302531] shadow-2xl">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#fbefed] text-[#9b504d]"><FiTrash2 size={19} /></span>
            <h2 id="clear-cart-title" className="mt-4 font-serif text-2xl">Clear your cart?</h2>
            <p className="mt-2 text-sm leading-5 text-[#777078]">All {cart.totalItems} {cart.totalItems === 1 ? "item" : "items"} will be removed from your cart.</p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button type="button" disabled={isClearingCart} onClick={() => setIsClearCartConfirmationOpen(false)} className="min-h-11 rounded-lg border border-[#cbb8c8] text-xs font-semibold text-[#30172f] transition hover:bg-[#f6eef4] disabled:opacity-60">Keep items</button>
              <button type="button" disabled={isClearingCart} onClick={() => void confirmClearCart()} className="rounded-lg bg-[#8e3936] text-xs font-semibold text-white transition hover:bg-[#762d2b] disabled:opacity-60">{isClearingCart ? "Clearing…" : "Clear cart"}</button>
            </div>
          </section>
        </div>
      )}

      <div aria-live="polite" className={`fixed bottom-5 left-1/2 z-[120] max-w-[calc(100vw-32px)] -translate-x-1/2 rounded-full bg-[#30172f] px-5 py-3 text-center text-[11px] text-white shadow-xl transition-all ${notice ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"}`}>{notice}</div>
    </main>
  );
}
