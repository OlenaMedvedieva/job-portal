import { useState } from "react";
function Login({
  email,
  password,
  setEmail,
  setPassword,
  handleSubmit,
}) {

    const [showPassword, setShowPassword] = useState(false);
  return (
    <form onSubmit={handleSubmit}>
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

    </form>
  );
}
export default Login;