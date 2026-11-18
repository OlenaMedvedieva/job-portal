
import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { Turnstile } from "@marsidev/react-turnstile";
function Login({
  email,
  password,
  setEmail,
  setPassword,
  handleSubmit,
  onGoogleSuccess,
  onFacebookSuccess
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [googleError, setGoogleError] = useState("");
  const [facebookError, setFacebookError] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
 console.log("TURNSTILE SITE KEY:", import.meta.env.VITE_TURNSTILE_SITE_KEY);
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        handleSubmit(event, turnstileToken);
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
 <Turnstile
  siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
  onSuccess={(token) => setTurnstileToken(token)}
  onExpire={() => setTurnstileToken("")}
  onError={() => setTurnstileToken("")}
/>
    <button
  className="submit-button"
  type="submit"
  disabled={!turnstileToken}
>
  Login
</button>
     
<div className="social-login">
  <p>Or continue with</p>

  <div className="social-login-buttons">
    <GoogleLogin
      onSuccess={(response) => {
        setGoogleError("");
        onGoogleSuccess(response);
      }}
      onError={() => {
        setGoogleError("Google login failed. Please try again.");
      }}
      theme="outline"
      size="large"
      shape="rectangular"
      text="continue_with"
      logo_alignment="center"
      width="300"
    />

    <button
      type="button"
      className="facebook-login-button"
      onClick={() => {
        setFacebookError("");

        if (!window.FB) {
          setFacebookError(
            "Facebook Login is not ready. Please refresh the page."
          );
          return;
        }

        window.FB.login(
          (response) => {
            if (response.authResponse?.accessToken) {
              onFacebookSuccess(
                response.authResponse.accessToken
              );
            } else {
              setFacebookError(
                "Facebook login was cancelled or failed."
              );
            }
          },
          {
            scope: "email,public_profile",
          }
        );
      }}
    >
      <span className="facebook-icon">f</span>
      Continue with Facebook
    </button>
  </div>

  {facebookError && (
    <p className="error-message">{facebookError}</p>
  )}

  {googleError && (
    <p className="error-message">{googleError}</p>
  )}
</div>

    </form>
  );
}

export default Login;
