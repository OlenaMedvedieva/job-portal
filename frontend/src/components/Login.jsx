
import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";

function Login({
  email,
  password,
  setEmail,
  setPassword,
  handleSubmit,
  onGoogleSuccess,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [googleError, setGoogleError] = useState("");

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        handleSubmit(event);
      }}
    >
      <label>
        Email
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          required
        />
      </label>

      <label>
        Password
        <div className="password-field">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            required
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>
      </label>

      <button className="submit-button" type="submit">
        Login
      </button>

      <div className="social-login">
        <p>Or continue with</p>

        <GoogleLogin
          onSuccess={(response) => {
            setGoogleError("");
            onGoogleSuccess(response);
          }}
          onError={() => {
            setGoogleError("Google login failed. Please try again.");
          }}
        />

        {googleError && (
          <p className="error-message">{googleError}</p>
        )}
      </div>
    </form>
  );
}

export default Login;
