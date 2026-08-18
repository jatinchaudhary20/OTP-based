import { useEffect, useState } from "react";
import api from "../services/api";
import type { LoginResponse, User } from "../types";

function Checkout() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");

  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");

  const [otpError, setOtpError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [user, setUser] = useState<User | null>(null);

  // Email validation
  const isValidEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  // Recognize registered user
  useEffect(() => {
    if (!isValidEmail(email)) {
      setIsRegistered(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsCheckingEmail(true);

        const response = await api.get(
          `/auth/recognize?email=${encodeURIComponent(email)}`
        );

        if (response.data.registered) {
          setIsRegistered(true);
          setShowOtpModal(true);
        } else {
          setIsRegistered(false);
        }
      } catch (error) {
        console.error("Email recognition failed:", error);
      } finally {
        setIsCheckingEmail(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [email]);

  // Login with OTP
  const handleLogin = async () => {
    if (!otp || otp.length !== 6) {
      setOtpError("Please enter a 6-digit code.");
      return;
    }

    try {
      setLoginLoading(true);
      setOtpError("");

      const response = await api.post<LoginResponse>(
        "/auth/login",
        {
          email,
          otp,
        }
      );

      const loginData = response.data;

      localStorage.setItem("token", loginData.token);

      setUser(loginData.user);
      setShowOtpModal(false);
      setOtp("");
    } catch (error: any) {
      setOtpError(
        error.response?.data?.message ||
          "Invalid OTP. Please try again."
      );
    } finally {
      setLoginLoading(false);
    }
  };

  // Skip login
  const handleSkip = () => {
    setShowOtpModal(false);
    setOtp("");
    setOtpError("");
  };

const [checkoutLoading, setCheckoutLoading] =
  useState(false);

const [checkoutMessage, setCheckoutMessage] =
  useState("");

const handleCheckoutSubmit = async (
  e: React.FormEvent<HTMLFormElement>
) => {
  e.preventDefault();

  try {
    setCheckoutLoading(true);
    setCheckoutMessage("");

    const response = await api.post(
      "/checkout",
      {
        email,
        phone,
        shippingAddress,
      }
    );

    setCheckoutMessage(
      response.data.message
    );

    setPhone("");
    setShippingAddress("");

  } catch (error: any) {
    setCheckoutMessage(
      error.response?.data?.message ||
        "Checkout submission failed"
    );
  } finally {
    setCheckoutLoading(false);
  }
};

  return (
    <div className="checkout-container">

      {user && (
        <div className="welcome-message">
          Welcome, {user.firstname} {user.lastname}
        </div>
      )}

      <h2>Checkout</h2>

      <form onSubmit={handleCheckoutSubmit}>

        {/* Email */}
        <div className="field">
          <label>Email</label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {isCheckingEmail && (
            <small>Checking email...</small>
          )}

          {isValidEmail(email) && !isCheckingEmail && (
            <small>
              {isRegistered
                ? "Registered user"
                : "Email available"}
            </small>
          )}
        </div>

        {/* Phone */}
        <div className="field">
          <label>Phone Number</label>

          <input
            type="tel"
            placeholder="Enter your phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>

        {/* Shipping Address */}
        <div className="field">
          <label>Shipping Address</label>

          <textarea
            placeholder="Enter your shipping address"
            value={shippingAddress}
            onChange={(e) =>
              setShippingAddress(e.target.value)
            }
            required
          />
        </div>

        <button
  type="submit"
  disabled={checkoutLoading}
>
  {checkoutLoading
    ? "Submitting..."
    : "Submit Checkout"}
</button>

      </form>
        {checkoutMessage && (
  <p>{checkoutMessage}</p>
)}
      {/* OTP MODAL */}
      {showOtpModal && (
        <div className="modal-overlay">

          <div className="otp-modal">

            <h3>Welcome Back!</h3>

            <p>
              We found a registered account with:
            </p>

            <strong>{email}</strong>

            <p>Enter your 6-digit login code.</p>

            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => {
                const value = e.target.value
                  .replace(/\D/g, "");

                setOtp(value);
                setOtpError("");
              }}
            />

            {otpError && (
              <p className="error">
                {otpError}
              </p>
            )}

            <div className="modal-buttons">

              <button
                type="button"
                onClick={handleLogin}
                disabled={loginLoading}
              >
                {loginLoading
                  ? "Logging in..."
                  : "Login"}
              </button>

              <button
                type="button"
                onClick={handleSkip}
              >
                Skip
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default Checkout;