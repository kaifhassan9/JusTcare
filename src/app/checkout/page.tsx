"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useRef, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";

type FormData = {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartTotal, clearCart } = useCart();

  const [formData, setFormData] = useState<FormData>({
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

  const requiresPrescription = cart.some((item) => item.requiresPrescription === true);

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
      alert("Please upload a JPG, PNG, or PDF file.");
      e.target.value = "";
      setPrescription(null);
      return;
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      alert("Prescription file must be smaller than 5MB.");
      e.target.value = "";
      setPrescription(null);
      return;
    }

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (submittingRef.current) return;
    submittingRef.current = true;
    setIsSubmitting(true);

    const isValid = validateForm();

    if (!isValid) {
      submittingRef.current = false;
      setIsSubmitting(false);
      return;
    }

    if (requiresPrescription && !prescription) {
      alert("Please upload a valid prescription before placing this order.");
      submittingRef.current = false;
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          items: cart.map((item) => ({ productId: item.id, quantity: item.quantity })),
        }),
      });

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
      <Navbar />

      <section className="border-b border-[#DDD3BC] bg-[#EDE6D6] py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-[#3D3A2E]">Checkout</h1>
          <p className="mt-1 text-sm font-medium text-[#6B6650]">Enter your details to place your order.</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12">
        <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-3 items-start">

          <div className="space-y-6 lg:col-span-2">

            {/* Step 1: Contact Information */}
            <div className="rounded-2xl border border-[#DDD3BC] bg-white p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl font-extrabold text-[#3D3A2E] flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#6B7256]/15 text-[#6B7256] text-xs font-black">1</span>
                Contact Information
              </h2>

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-[#6B6650]">
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
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
            </div>

            {/* Step 2: Delivery Address */}
            <div className="rounded-2xl border border-[#DDD3BC] bg-white p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl font-extrabold text-[#3D3A2E] flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#6B7256]/15 text-[#6B7256] text-xs font-black">2</span>
                Delivery Address
              </h2>

              <div className="mt-6 space-y-5">
                <div>
                  <label htmlFor="address" className="block text-xs font-bold uppercase tracking-wider text-[#6B6650]">
                    Address
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    rows={3}
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
            </div>

            {/* Prescription Requirement */}
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

            {/* Step 3: Payment Method */}
            <div className="rounded-2xl border border-[#DDD3BC] bg-white p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl font-extrabold text-[#3D3A2E] flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#6B7256]/15 text-[#6B7256] text-xs font-black">3</span>
                Payment Method
              </h2>

              <div className="mt-5 rounded-2xl border border-[#DDD3BC] bg-[#F7F5EF] p-4 sm:p-5">
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    id="cod"
                    name="payment"
                    defaultChecked
                    className="h-4 w-4 accent-[#6B7256]"
                  />
                  <label htmlFor="cod" className="font-bold text-[#3D3A2E] text-base cursor-pointer">
                    Cash on Delivery
                  </label>
                </div>
                <p className="mt-2 pl-7 text-xs font-medium text-[#6B6650]">
                  Pay when your medicine is delivered.
                </p>
              </div>

              <p className="mt-4 text-xs font-medium text-[#8B8570] flex items-center gap-1.5">
                <span>ℹ️</span>
                <span>Online payment will be added in a later version.</span>
              </p>
            </div>
          </div>

          {/* Order Summary */}
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
              {isSubmitting ? "Placing Order..." : "Place Order"}
            </button>

            <p className="mt-4 text-center text-xs leading-relaxed text-[#6B6650]">
              By placing your order, you agree to our terms and pharmacy verification requirements.
            </p>
          </div>
        </form>
      </section>

      <Footer />
    </main>
  );
}