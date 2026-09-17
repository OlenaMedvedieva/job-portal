
import { useState } from "react";

function Register({
  name,
  email,
  password,
  role,
  message,
  setName,
  setEmail,
  setPassword,
  setRole,
  handleSubmit,
  resendVerification,
}) {
  const [resendMessage, setResendMessage] = useState("");

  const handleResend = async () => {
    const result = await resendVerification();
    setResendMessage(result);
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Name
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Your name"
        />
      </label>

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
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
          required
        />
      </label>

      <label>
        I want to
        <select
          value={role}
          onChange={(event) => setRole(event.target.value)}
        >
          <option value="job_seeker">👤 Find a job</option>
          <option value="employer">🏢 Hire people</option>
        </select>
      </label>

      {message && <p className="form-message">{message}</p>}

      <button className="submit-button" type="submit">
        Create account
      </button>

      <button
        className="submit-button"
        type="button"
        onClick={handleResend}
      >
        Resend verification email
      </button>

      {resendMessage && (
        <p className="form-message">{resendMessage}</p>
      )}
    </form>
  );
}

export default Register;