import {  useState } from "react";
import type { FormEvent } from "react";
import api from "../services/api";
import  type { RegisterResponse } from "../types";

interface Props {
    onRegistered: () => void;
}

const RegistrationForm = ({ onRegistered }: Props) => {
    const [email, setEmail] = useState("");
    const [firstname, setFirstName] = useState("");
    const [lastname, setLastName] = useState("");
    
    const [otp, setOtp] = useState("");
    const [message, setMessage] = useState("");

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            setMessage("");
            const response = await api.post<RegisterResponse>("/auth/register", {
                email : email,
                firstname : firstname,
                lastname : lastname
            });
            setOtp(response.data.otp);
            setMessage("Registration Successful!");
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Registration failed. Please try again.";
            setMessage(errorMessage);
        } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Create Account</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="First Name"
          value={firstname}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Last Name"
          value={lastname}
          onChange={(e) => setLastName(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>
      </form>

      {message && <p>{message}</p>}

      {otp && (
        <div className="otp-display">
          <p>Your login code is:</p>

          <strong>{otp}</strong>

          <button type="button" onClick={onRegistered}>
            Continue to Checkout
          </button>
        </div>
      )}
    </div>
  );
};

export default RegistrationForm;