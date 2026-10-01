"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import Script from "next/script";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";

type FormDataState = {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
};

interface Address extends FormDataState {
  id: number;
}

type FormErrors = Partial<Record<keyof FormDataState | "prescription", string>>;
type PaymentMethod = "COD" | "ONLINE";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartTotal, clearCart } = useCart();

  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | "new">("new");
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [formData, setFormData] = useState<FormDataState>({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const [prescription, setPrescription] = useState<File | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");
  const [paymentError, setPaymentError] = useState("");

  const requiresPrescription = cart.some((item) => item.requiresPrescription === true);

  // If prescription becomes required (e.g. cart changes), force back to COD —
  // online payment isn't offered for orders that still need pharmacist review
  useEffect(() => {
    if (requiresPrescription && paymentMethod === "ONLINE") {
      setPaymentMethod("COD");
    }
  }, [requiresPrescription, paymentMethod]);

  useEffect(() => {
    async function loadAddresses() {
      try {
        const res = await fetch("/api/user/addresses");
        const data = await res.json();
        if (data.success && data.addresses.length > 0) {
          setSavedAddresses(data.addresses);
          setSelectedAddressId(data.addresses[0].id);
          setFormData({
            name: data.addresses[0].name || "",
            phone: data.addresses[0].phone || "",
            email: data.addresses[0].email || "",
            address: data.addresses[0].address || "",
            city: data.addresses[0].city || "",
            state: data.addresses[0].state || "",
            pincode: data.addresses[0].pincode || "",
          });
        }
      } catch (err) {
        console.error("Failed to load saved addresses:", err);
      } finally {
        setLoadingAddresses(false);
      }
    }
    loadAddresses();
  }, []);

  const handleSelectAddress = (addr: Address) => {
    setSelectedAddressId(addr.id);
    setFormData({
      name: addr.name || "",
      phone: addr.phone || "",
      email: addr.email || "",
      address: addr.address || "",
      city: addr.city || "",
      state: addr.state || "",
      pincode: addr.pincode || "",
    });
    setErrors({});
  };

  const handleAddNewAddressOption = () => {
    setSelectedAddressId("new");
    setFormData({
      name: "",
      phone: "",
      email: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
    });
    setErrors({});
  };

  const handleDeleteAddress = async (e: React.MouseEvent, id: number | string) => {
    e.stopPropagation();

    setDeletingId(id as number);
    try {
      const res = await fetch(`/api/user/addresses/${id}`, { method: "DELETE" });
      const data = await res.json();

      if (res.ok && data.success) {
        const updatedAddresses = savedAddresses.filter((addr) => addr.id !== id);
        setSavedAddresses(updatedAddresses);

        if (selectedAddressId === id) {
          if (updatedAddresses.length > 0) {
            handleSelectAddress(updatedAddresses[0]);
          } else {
            handleAddNewAddressOption();
          }
        }
      } else {
        console.error(data.error || "Failed to delete address.");
      }
    } catch (err) {
      console.error("Error deleting address:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  };

  const handlePrescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      setPrescription(null);
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];

    if (!allowedTypes.includes(file.type)) {
      setErrors((prev) => ({ ...prev, prescription: "Please upload a JPG, PNG, or PDF file." }));
      e.target.value = "";
      setPrescription(null);
      return;
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      setErrors((prev) => ({ ...prev, prescription: "Prescription file must be smaller than 5MB." }));
      e.target.value = "";
      setPrescription(null);
      return;
    }

    setErrors((prev) => ({ ...prev, prescription: "" }));
    setPrescription(file);
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) newErrors.name = "Please enter your full name.";

    if (!formData.phone.trim()) {
      newErrors.phone = "Please enter your mobile number.";
    } else if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid 10-digit mobile number.";
    }

    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!formData.address.trim()) newErrors.address = "Please enter your delivery address.";
    if (!formData.city.trim()) newErrors.city = "Please enter your city.";
    if (!formData.state.trim()) newErrors.state = "Please enter your state.";

    if (!formData.pincode.trim()) {
      newErrors.pincode = "Please enter your PIN code.";
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = "PIN code must contain exactly 6 digits.";
    }

    if (requiresPrescription && !prescription) {
      newErrors.prescription = "Please upload a valid prescription before placing this order.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // COD flow — unchanged from before
  async function placeCodOrder() {
    let response: Response;

    if (prescription) {
      const body = new FormData();
      Object.entries(formData).forEach(([key, value]) => body.append(key, value));
      body.append("items", JSON.stringify(cart.map((i) => ({ productId: i.id, quantity: i.quantity }))));
      body.append("prescription", prescription);

      response = await fetch("/api/orders", { method: "POST", credentials: "include", body });
    } else {
      response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...formData,
          items: cart.map((item) => ({ productId: item.id, quantity: item.quantity })),
        }),
      });
    }

    if (response.status === 401) {
      submittingRef.current = false;
      setIsSubmitting(false);
      router.push("/login?redirect=/checkout");
      return;
    }

    const data = await response.json();

    if (!response.ok) {
      console.error("Order creation failed:", data);
      submittingRef.current = false;
      setIsSubmitting(false);
      alert(data.message || "Failed to place order.");
      return;
    }

    if (typeof clearCart === "function") clearCart();
    router.push(`/order-success?orderNumber=${data.order.orderNumber}`);
  }

  // Online payment flow — creates a Razorpay order, opens the checkout popup,
  // then verifies the payment server-side before creating the real order
  async function placeOnlineOrder() {
    setPaymentError("");

    try {
      const createResponse = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: cartTotal }),
      });

      if (createResponse.status === 401) {
        submittingRef.current = false;
        setIsSubmitting(false);
        router.push("/login?redirect=/checkout");
        return;
      }

      const createData = await createResponse.json();

      if (!createResponse.ok) {
        submittingRef.current = false;
        setIsSubmitting(false);
        setPaymentError(createData.error || "Failed to start payment.");
        return;
      }

      // Open Razorpay's hosted checkout popup — customer enters card/UPI
      // details directly with Razorpay; this app never sees that data
      const razorpayOptions = {
        key: createData.keyId,
        amount: createData.amount,
        currency: createData.currency,
        name: "JustCare",
        description: "Order Payment",
        order_id: createData.orderId,
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        theme: { color: "#6B7256" },
        handler: async function (response: any) {
          try {
            const verifyResponse = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                ...formData,
                items: cart.map((item) => ({ productId: item.id, quantity: item.quantity })),
              }),
            });

            const verifyData = await verifyResponse.json();

            if (!verifyResponse.ok) {
              setPaymentError(verifyData.error || "Payment verification failed.");
              submittingRef.current = false;
              setIsSubmitting(false);
              return;
            }

            if (typeof clearCart === "function") clearCart();
            router.push(`/order-success?orderNumber=${verifyData.order.orderNumber}`);
          } catch (err) {
            console.error("Payment verification error:", err);
            setPaymentError("Something went wrong verifying your payment. Please contact support if money was deducted.");
            submittingRef.current = false;
            setIsSubmitting(false);
          }
        },
        modal: {
          // Customer closed the popup without paying — just reset the button,
          // no order was created, nothing to clean up
          ondismiss: function () {
            submittingRef.current = false;
            setIsSubmitting(false);
          },
        },
      };

      const razorpayInstance = new window.Razorpay(razorpayOptions);
      razorpayInstance.open();
    } catch (error) {
      console.error("Online payment error:", error);
      submittingRef.current = false;
      setIsSubmitting(false);
      setPaymentError("Something went wrong. Please try again.");
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (submittingRef.current) return;
    submittingRef.current = true;
    setIsSubmitting(true);
    setPaymentError("");

    const isValid = validateForm();

    if (!isValid) {
      submittingRef.current = false;
      setIsSubmitting(false);
      return;
    }

    try {
      if (paymentMethod === "ONLINE") {
        await placeOnlineOrder();
        // Note: for online payment, isSubmitting/submittingRef reset happens
        // inside placeOnlineOrder's callbacks (success, dismiss, or error),
        // since the flow pauses here waiting for the Razorpay popup
      } else {
        await placeCodOrder();
      }
    } catch (error) {
      console.error("Place order error:", error);
      submittingRef.current = false;
      setIsSubmitting(false);
      alert("Something went wrong while placing your order.");
    }
  };

  if (cart.length === 0) {
    return (
      <main className="min-h-screen bg-[#F7F5EF] text-[#3D3A2E]">
        <Navbar />
        <section className="flex min-h-[65vh] items-center justify-center px-4 sm:px-6">
          <div className="max-w-md w-full rounded-3xl border border-[#DDD3BC] bg-white p-8 sm:p-10 text-center shadow-sm">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-[#F7F5EF] text-6xl border border-[#DDD3BC]">
              🛒
            </div>
            <h1 className="mt-6 text-2xl font-extrabold text-[#3D3A2E]">Your Cart is Empty</h1>
            <p className="mt-2 text-sm text-[#6B6650]">Add some products before proceeding to checkout.</p>
            <Link
              href="/products"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#6B7256] px-7 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-[#5a6047] transition-all"
            >
              Browse Products
            </Link>
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F5EF] text-[#3D3A2E]">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <Navbar />

      <section className="border-b border-[#DDD3BC] bg-[#EDE6D6] py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-[#3D3A2E]">Checkout</h1>
          <p className="mt-1 text-sm font-medium text-[#6B6650]">Select a delivery address or add a new one to place your order.</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12">
        <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-3 items-start">
          <div className="space-y-6 lg:col-span-2">

            {/* Step 1: Delivery Address Selection */}
            <div className="rounded-2xl border border-[#DDD3BC] bg-white p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl font-extrabold text-[#3D3A2E] flex items-center gap-2 mb-6">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#6B7256]/15 text-[#6B7256] text-xs font-black">
                  1
                </span>
                Delivery Address
              </h2>

              {loadingAddresses ? (
                <div className="py-6 text-center text-sm font-medium text-[#6B6650]">
                  Loading saved addresses...
                </div>
              ) : (
                <>
                  {savedAddresses.length > 0 && (
                    <div className="mb-6 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {savedAddresses.map((addr) => (
                          <div
                            key={addr.id}
                            onClick={() => handleSelectAddress(addr)}
                            className={`relative p-4 rounded-xl border-2 cursor-pointer transition ${
                              selectedAddressId === addr.id
                                ? "border-[#6B7256] bg-[#6B7256]/10"
                                : "border-[#DDD3BC] bg-[#F7F5EF]/50 hover:border-[#6B7256]/50"
                            }`}
                          >
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-bold text-sm text-[#3D3A2E]">{addr.name}</span>
                              <div className="flex items-center gap-2">
                                {selectedAddressId === addr.id && (
                                  <span className="text-[10px] bg-[#6B7256] text-white px-2 py-0.5 rounded-full font-bold">
                                    Selected
                                  </span>
                                )}
                                <button
                                  type="button"
                                  onClick={(e) => handleDeleteAddress(e, addr.id)}
                                  disabled={deletingId === addr.id}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-100 p-1 rounded-md transition text-xs font-bold"
                                  title="Delete address"
                                >
                                  {deletingId === addr.id ? "..." : <i className="fa-solid fa-trash"></i>}
                                </button>
                              </div>
                            </div>
                            <p className="text-xs text-[#6B6650]">{addr.address}, {addr.city}</p>
                            <p className="text-xs text-[#6B6650]">{addr.state} - {addr.pincode}</p>
                            <p className="text-xs font-medium text-[#3D3A2E] mt-2"> {addr.phone}</p>
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={handleAddNewAddressOption}
                        className={`w-full py-3 px-4 rounded-xl border-2 border-dashed text-sm font-semibold transition ${
                          selectedAddressId === "new"
                            ? "border-[#6B7256] bg-[#6B7256]/10 text-[#6B7256]"
                            : "border-[#DDD3BC] text-[#6B6650] hover:border-[#6B7256]"
                        }`}
                      >
                        + Add New Delivery Address
                      </button>
                    </div>
                  )}
                </>
              )}

              {(selectedAddressId === "new" || savedAddresses.length === 0) && (
                <div className={`space-y-5 ${savedAddresses.length > 0 ? "border-t border-[#DDD3BC] pt-6" : ""}`}>
                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-[#6B6650]">
                        Full Name
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter full name"
                        className={`mt-2 w-full rounded-xl border px-4 py-3 text-sm text-[#3D3A2E] bg-[#F7F5EF] placeholder:text-[#8B8570] outline-none transition-all ${
                          errors.name
                            ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                            : "border-[#DDD3BC] focus:border-[#6B7256] focus:bg-white focus:ring-2 focus:ring-[#6B7256]/15"
                        }`}
                      />
                      {errors.name && <p className="mt-1.5 text-xs font-medium text-red-500">{errors.name}</p>}
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-xs font-bold uppercase tracking-wider text-[#6B6650]">
                        Mobile Number
                      </label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        autoComplete="tel"
                        inputMode="numeric"
                        maxLength={10}
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="10-digit mobile number"
                        className={`mt-2 w-full rounded-xl border px-4 py-3 text-sm text-[#3D3A2E] bg-[#F7F5EF] placeholder:text-[#8B8570] outline-none transition-all ${
                          errors.phone
                            ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                            : "border-[#DDD3BC] focus:border-[#6B7256] focus:bg-white focus:ring-2 focus:ring-[#6B7256]/15"
                        }`}
                      />
                      {errors.phone && <p className="mt-1.5 text-xs font-medium text-red-500">{errors.phone}</p>}
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-[#6B6650]">
                        Email Address
                        <span className="ml-1 text-[#8B8570] normal-case font-normal">(Optional)</span>
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter email address"
                        className={`mt-2 w-full rounded-xl border px-4 py-3 text-sm text-[#3D3A2E] bg-[#F7F5EF] placeholder:text-[#8B8570] outline-none transition-all ${
                          errors.email
                            ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                            : "border-[#DDD3BC] focus:border-[#6B7256] focus:bg-white focus:ring-2 focus:ring-[#6B7256]/15"
                        }`}
                      />
                      {errors.email && <p className="mt-1.5 text-xs font-medium text-red-500">{errors.email}</p>}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="address" className="block text-xs font-bold uppercase tracking-wider text-[#6B6650]">
                      Address
                    </label>
                    <textarea
                      id="address"
                      name="address"
                      rows={3}
                      autoComplete="street-address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="House number, street, area..."
                      className={`mt-2 w-full resize-none rounded-xl border px-4 py-3 text-sm text-[#3D3A2E] bg-[#F7F5EF] placeholder:text-[#8B8570] outline-none transition-all ${
                        errors.address
                          ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                          : "border-[#DDD3BC] focus:border-[#6B7256] focus:bg-white focus:ring-2 focus:ring-[#6B7256]/15"
                      }`}
                    />
                    {errors.address && <p className="mt-1.5 text-xs font-medium text-red-500">{errors.address}</p>}
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label htmlFor="city" className="block text-xs font-bold uppercase tracking-wider text-[#6B6650]">
                        City
                      </label>
                      <input
                        id="city"
                        name="city"
                        type="text"
                        autoComplete="address-level2"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="Enter city"
                        className={`mt-2 w-full rounded-xl border px-4 py-3 text-sm text-[#3D3A2E] bg-[#F7F5EF] placeholder:text-[#8B8570] outline-none transition-all ${
                          errors.city
                            ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                            : "border-[#DDD3BC] focus:border-[#6B7256] focus:bg-white focus:ring-2 focus:ring-[#6B7256]/15"
                        }`}
                      />
                      {errors.city && <p className="mt-1.5 text-xs font-medium text-red-500">{errors.city}</p>}
                    </div>

                    <div>
                      <label htmlFor="state" className="block text-xs font-bold uppercase tracking-wider text-[#6B6650]">
                        State
                      </label>
                      <input
                        id="state"
                        name="state"
                        type="text"
                        autoComplete="address-level1"
                        value={formData.state}
                        onChange={handleChange}
                        placeholder="Enter state"
                        className={`mt-2 w-full rounded-xl border px-4 py-3 text-sm text-[#3D3A2E] bg-[#F7F5EF] placeholder:text-[#8B8570] outline-none transition-all ${
                          errors.state
                            ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                            : "border-[#DDD3BC] focus:border-[#6B7256] focus:bg-white focus:ring-2 focus:ring-[#6B7256]/15"
                        }`}
                      />
                      {errors.state && <p className="mt-1.5 text-xs font-medium text-red-500">{errors.state}</p>}
                    </div>
                  </div>

                  <div className="md:w-1/2">
                    <label htmlFor="pincode" className="block text-xs font-bold uppercase tracking-wider text-[#6B6650]">
                      PIN Code
                    </label>
                    <input
                      id="pincode"
                      name="pincode"
                      type="text"
                      autoComplete="postal-code"
                      inputMode="numeric"
                      maxLength={6}
                      value={formData.pincode}
                      onChange={handleChange}
                      placeholder="6-digit PIN code"
                      className={`mt-2 w-full rounded-xl border px-4 py-3 text-sm text-[#3D3A2E] bg-[#F7F5EF] placeholder:text-[#8B8570] outline-none transition-all ${
                        errors.pincode
                          ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                          : "border-[#DDD3BC] focus:border-[#6B7256] focus:bg-white focus:ring-2 focus:ring-[#6B7256]/15"
                      }`}
                    />
                    {errors.pincode && <p className="mt-1.5 text-xs font-medium text-red-500">{errors.pincode}</p>}
                  </div>
                </div>
              )}
            </div>

            {/* Prescription Section */}
            {requiresPrescription && (
              <div className="rounded-2xl border border-[#8B7355]/30 bg-[#8B7355]/10 p-6">
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#8B7355]/20 text-xl text-[#8B7355]">
                    ⚠️
                  </div>

                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-[#3D3A2E]">Prescription Required</h2>
                    <p className="mt-1 text-xs leading-relaxed text-[#6B6650]">
                      One or more medicines in your cart require a valid prescription. Please upload it so our pharmacy team can verify your order.
                    </p>

                    <div className="mt-5">
                      <label htmlFor="prescription" className="block text-xs font-bold uppercase tracking-wider text-[#3D3A2E]">
                        Upload Prescription
                      </label>
                      <input
                        id="prescription"
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={handlePrescriptionChange}
                        className="mt-2 block w-full rounded-xl border border-[#8B7355]/40 bg-white px-3.5 py-3 text-sm text-[#3D3A2E] file:mr-4 file:rounded-lg file:border-0 file:bg-[#8B7355]/15 file:px-4 file:py-2 file:text-xs file:font-bold file:text-[#8B7355] hover:file:bg-[#8B7355]/25 cursor-pointer"
                      />
                      <p className="mt-2 text-[11px] text-[#6B6650]">
                        Accepted formats: JPG, PNG, PDF. Maximum size: 5MB.
                      </p>

                      {errors.prescription && (
                        <p className="mt-2 text-xs font-medium text-red-500">{errors.prescription}</p>
                      )}

                      {prescription && (
                        <div className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[#6B7256]/10 border border-[#6B7256]/25 px-3.5 py-2 text-xs font-bold text-[#6B7256]">
                          <span>✓ Selected:</span>
                          <span className="font-semibold underline">{prescription.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Payment Method */}
            <div className="rounded-2xl border border-[#DDD3BC] bg-white p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl font-extrabold text-[#3D3A2E] flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#6B7256]/15 text-[#6B7256] text-xs font-black">
                  2
                </span>
                Payment Method
              </h2>

              <div className="mt-5 space-y-3">
                {/* Cash on Delivery */}
                <label
                  htmlFor="cod"
                  className={`flex items-start gap-3 rounded-2xl border p-4 sm:p-5 cursor-pointer transition ${
                    paymentMethod === "COD" ? "border-[#6B7256] bg-[#6B7256]/5" : "border-[#DDD3BC] bg-[#F7F5EF]"
                  }`}
                >
                  <input
                    type="radio"
                    id="cod"
                    name="payment"
                    checked={paymentMethod === "COD"}
                    onChange={() => setPaymentMethod("COD")}
                    className="mt-1 h-4 w-4 accent-[#6B7256]"
                  />
                  <div>
                    <span className="font-bold text-[#3D3A2E] text-base">Cash on Delivery</span>
                    <p className="mt-1 text-xs font-medium text-[#6B6650]">
                      Pay when your medicine is delivered.
                    </p>
                  </div>
                </label>

                {/* Online Payment */}
                <label
                  htmlFor="online"
                  className={`flex items-start gap-3 rounded-2xl border p-4 sm:p-5 transition ${
                    requiresPrescription
                      ? "border-[#DDD3BC] bg-[#F7F5EF]/50 opacity-60 cursor-not-allowed"
                      : paymentMethod === "ONLINE"
                      ? "border-[#6B7256] bg-[#6B7256]/5 cursor-pointer"
                      : "border-[#DDD3BC] bg-[#F7F5EF] cursor-pointer"
                  }`}
                >
                  <input
                    type="radio"
                    id="online"
                    name="payment"
                    checked={paymentMethod === "ONLINE"}
                    onChange={() => setPaymentMethod("ONLINE")}
                    disabled={requiresPrescription}
                    className="mt-1 h-4 w-4 accent-[#6B7256]"
                  />
                  <div>
                    <span className="font-bold text-[#3D3A2E] text-base">Pay Online</span>
                    <p className="mt-1 text-xs font-medium text-[#6B6650]">
                      {requiresPrescription
                        ? "Not available when a prescription needs review — please use Cash on Delivery."
                        : "Pay securely via UPI, card, or netbanking."}
                    </p>
                  </div>
                </label>
              </div>

              {paymentError && (
                <p className="mt-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs font-semibold text-red-600">
                  {paymentError}
                </p>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="rounded-2xl border border-[#DDD3BC] bg-white p-6 shadow-sm sticky top-28">
            <h2 className="text-xl font-extrabold text-[#3D3A2E] pb-4 border-b border-[#EDE6D6]">
              Order Summary
            </h2>

            <div className="mt-6 space-y-4 max-h-72 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.id} className="flex items-start justify-between gap-3 text-sm">
                  <div>
                    <p className="font-bold text-[#3D3A2E]">{item.name}</p>
                    <p className="mt-0.5 text-xs text-[#8B8570]">Qty: {item.quantity}</p>
                    {item.requiresPrescription && (
                      <span className="mt-1 inline-block rounded-full bg-[#8B7355]/15 px-2 py-0.5 text-[10px] font-bold text-[#8B7355]">
                        Rx required
                      </span>
                    )}
                  </div>
                  <p className="font-extrabold text-[#3D3A2E] shrink-0">₹{item.price * item.quantity}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-3.5 border-t border-[#EDE6D6] pt-5">
              <div className="flex justify-between text-sm">
                <span className="text-[#6B6650]">Subtotal</span>
                <span className="font-bold text-[#3D3A2E]">₹{cartTotal}</span>
              </div>

              <div className="flex justify-between text-sm items-center">
                <span className="text-[#6B6650]">Delivery</span>
                <span className="rounded-full bg-[#6B7256]/15 px-2 py-0.5 text-xs font-extrabold text-[#6B7256]">
                  FREE
                </span>
              </div>

              <div className="flex justify-between border-t border-[#EDE6D6] pt-4 items-baseline">
                <span className="font-bold text-[#3D3A2E]">Total</span>
                <span className="text-2xl font-extrabold text-[#3D3A2E]">₹{cartTotal}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 w-full rounded-full bg-[#8B7355] py-3.5 text-center text-sm font-bold text-white shadow-sm hover:bg-[#7a6549] active:scale-95 transition-all disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting
                ? paymentMethod === "ONLINE" ? "Opening payment..." : "Placing Order..."
                : paymentMethod === "ONLINE" ? "Proceed to Pay" : "Place Order"}
            </button>
          </div>
        </form>
      </section>

      <Footer />
    </main>
  );
}