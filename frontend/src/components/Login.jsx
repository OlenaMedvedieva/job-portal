function Login({
  email,
  password,
  setEmail,
  setPassword,
  handleSubmit,
}) {
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
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
          required
        />
      </label>

      <button className="submit-button" type="submit">
        Login
      </button>
    </form>
  );
}

export default Login;