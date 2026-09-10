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
}) {
return ( <form onSubmit={handleSubmit}> <label>
Name
<input
type="text"
value={name}
onChange={(event) => setName(event.target.value)}
placeholder="Your name"
/> </label>

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
</form>

);
}

export default Register;
