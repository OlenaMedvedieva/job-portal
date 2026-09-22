require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");
const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});
transporter.verify((error, success) => {
  if (error) {
    console.error("Email transporter error:", error);
  } else {
    console.log("Email transporter is ready");
  }
});

const app = express();
const PORT = process.env.PORT || 3000;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
});

pool.query(`
  ALTER TABLE users
  ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'job_seeker'
`).then(() => {
  console.log("Users role column is ready");
}).catch((error) => {
  console.error("Users role column error:", error);
});
pool.query(`
  ALTER TABLE users
  ADD COLUMN IF NOT EXISTS job_title VARCHAR(255)
`).then(() => {
  console.log("Users job title column is ready");
}).catch((error) => {
  console.error("Users job title column error:", error);
});

pool.query(`
  ALTER TABLE users
  ADD COLUMN IF NOT EXISTS city VARCHAR(255)
`).then(() => {
  console.log("Users city column is ready");
}).catch((error) => {
  console.error("Users city column error:", error);
});
pool.query(`
  ALTER TABLE users
  ADD COLUMN IF NOT EXISTS skills TEXT
`).then(() => {
  console.log("Users skills column is ready");
}).catch((error) => {
  console.error("Users skills column error:", error);
});
pool.query(`
  ALTER TABLE users
  ADD COLUMN IF NOT EXISTS experience TEXT
`).then(() => {
  console.log("Users experience column is ready");
}).catch((error) => {
  console.error("Users experience column error:", error);
});
pool.query(`
  ALTER TABLE users
  ADD COLUMN IF NOT EXISTS education TEXT
`).then(() => {
  console.log("Users education column is ready");
}).catch((error) => {
  console.error("Users education column error:", error);
});

pool.query(`
  ALTER TABLE users
  ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false
`).then(() => {
  console.log("Users email verification column is ready");
}).catch((error) => {
  console.error("Users email verification column error:", error);
});
pool.query(`
  ALTER TABLE users
  ADD COLUMN IF NOT EXISTS email_verification_token VARCHAR(255)
`).then(() => {
  console.log("Users email verification token column is ready");
}).catch((error) => {
  console.error("Users email verification token column error:", error);
});

pool.query(`
  CREATE TABLE IF NOT EXISTS jobs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    description TEXT,
    salary VARCHAR(100),
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`).then(() => {
  console.log("Jobs table is ready");
}).catch((error) => {
  console.error("Jobs table error:", error);
});

pool.query(`
  CREATE TABLE IF NOT EXISTS applications (
    id SERIAL PRIMARY KEY,
    job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(job_id, user_id)
  )
`).then(() => {
  console.log("Applications table is ready");
}).catch((error) => {
  console.error("Applications table error:", error);
});


app.use(cors());
app.use(express.json());
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Access token is required",
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (error, user) => {
    if (error) {
      return res.status(403).json({
        message: "Invalid or expired token",
      });
    }

    req.user = user;
    next();
  });
};

app.get("/", (req, res) => {
  res.json({
    message: "Job Portal API is running",
  });
});

app.get("/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() AS current_time");

    res.json({
      database: "connected",
      current_time: result.rows[0].current_time,
    });
  } catch (error) {
    console.error("Database connection error:", error);

    res.status(500).json({
      database: "connection failed",
      error: error.message,
    });
  }
});

app.post("/register", async (req, res) => {
  try {
    const { name, email, password , role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        message: "User with this email already exists",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const verificationToken = require("crypto").randomBytes(32).toString("hex");

const result = await pool.query(
  `INSERT INTO users (
    name,
    email,
    password_hash,
    role,
    email_verification_token
  )
  VALUES ($1, $2, $3, $4, $5)
  RETURNING id, name, email, role, created_at`,
  [
    name,
    email,
    passwordHash,
    role || "job_seeker",
    verificationToken,
  ]
);
await transporter.sendMail({
  from: process.env.EMAIL_USER,
  to: email,
  subject: "Verify your Job Portal email",
  html:   `
    <h2>Welcome to Job Portal!</h2>
    <p>Please verify your email address by clicking the link below:</p>
    <p>
       <a href="http://192.168.0.103:3000/verify-email/${verificationToken}">
    Verify Email
      </a>
    </p>
    `,
});

res.status(201).json({
  message: "Registration successful! Please check your email to verify your account.",
  user: result.rows[0],
});
  } catch (error) {
    console.error("Registration error:", error);

    res.status(500).json({
      message: "Registration failed",
    });
  }
});
app.get("/verify-email/:token", async (req, res) => {
  try {
    const { token } = req.params;

    const result = await pool.query(
      `UPDATE users
       SET email_verified = true,
           email_verification_token = NULL
       WHERE email_verification_token = $1
       RETURNING id, name, email`,
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).send("Invalid or expired verification link");
    }

    res.send("Email verified successfully! You can now log in.");
  } catch (error) {
    console.error("Email verification error:", error);

    res.status(500).send("Email verification failed");
  }
});
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const result = await pool.query(
      "SELECT id, name, email, password_hash, role, email_verified FROM users WHERE email = $1",
  [email]
);
    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }
   

    const user = result.rows[0];

    const passwordMatch = await bcrypt.compare(
      password,
      user.password_hash
    );
 if (!user.email_verified) {
  return res.status(403).json({
    message: "Please verify your email before logging in.",
  });
}
    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );
    

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
         role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      message: "Login failed",
    });
  }
});
app.post("/resend-verification", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const userResult = await pool.query(
      "SELECT id, email, email_verified FROM users WHERE email = $1",
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        message: "User with this email does not exist",
      });
    }

    const user = userResult.rows[0];

    if (user.email_verified) {
      return res.status(400).json({
        message: "Email is already verified",
      });
    }

    const verificationToken = require("crypto")
      .randomBytes(32)
      .toString("hex");

    await pool.query(
      `UPDATE users
       SET email_verification_token = $1
       WHERE id = $2`,
      [verificationToken, user.id]
    );

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "New Job Portal verification link",
      html: `
        <h2>Verify your Job Portal email</h2>
        <p>Here is your new verification link:</p>
        <p>
        <a href="http://172.23.47.70:3000/verify-email/${verificationToken}">
            Verify Email
          </a>
        </p>
      `,
    });

    res.json({
      message: "A new verification email has been sent!",
    });
  } catch (error) {
    console.error("Resend verification error:", error);

    res.status(500).json({
      message: "Failed to resend verification email",
    });
  }
});
app.get("/profile", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, role, job_title, city, skills, experience, education, created_at FROM users WHERE id = $1",
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Profile error:", error);

    res.status(500).json({
      message: "Failed to load profile",
    });
  }
});

app.put("/profile", authenticateToken, async (req, res) => {
  try {
    const { jobTitle , city , skills , experience , education } = req.body;

    const result = await pool.query(
      `UPDATE users
       SET job_title = $1, city = $2, skills = $3, experience = $4, education = $5
       WHERE id = $6
       RETURNING id, name, email, role, job_title, city, skills, experience, education, created_at`,
     [ 
        jobTitle || null,
        city || null,
        skills || null, 
        experience || null, 
        education || null,
        req.user.id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      message: "Profile updated successfully",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Update profile error:", error);

    res.status(500).json({
      message: "Failed to update profile",
    });
  }
});

app.post("/jobs", authenticateToken, async (req, res) => {
  try {
    const {
      title,
      company,
      location,
      description,
      salary,
    } = req.body;

    if (!title || !company) {
      return res.status(400).json({
        message: "Title and company are required",
      });
    }

    const result = await pool.query(
      `INSERT INTO jobs
       (title, company, location, description, salary, user_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, title, company, location, description, salary, user_id, created_at`,
      [
        title,
        company,
        location || null,
        description || null,
        salary || null,
        req.user.id,
      ]
    );

    res.status(201).json({
      message: "Job created successfully",
      job: result.rows[0],
    });
  } catch (error) {
    console.error("Create job error:", error);

    res.status(500).json({
      message: "Failed to create job",
    });
  }
});


app.get("/applications/my", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        applications.id,
        applications.job_id,
        applications.status,
        applications.created_at,
        jobs.title,
        jobs.company,
        jobs.location,
        jobs.salary
       FROM applications
       JOIN jobs ON applications.job_id = jobs.id
       WHERE applications.user_id = $1
       ORDER BY applications.created_at DESC`,
      [req.user.id]
    );

    res.json({
      applications: result.rows,
    });
  } catch (error) {
    console.error("Get my applications error:", error);

    res.status(500).json({
      message: "Failed to load applications",
    });
  }
});

app.get("/jobs", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        jobs.id,
        jobs.title,
        jobs.company,
        jobs.location,
        jobs.description,
        jobs.salary,
        jobs.created_at,
        users.name AS author
       FROM jobs
       LEFT JOIN users ON jobs.user_id = users.id
       ORDER BY jobs.created_at DESC`
    );

    res.json({
      jobs: result.rows,
    });
  } catch (error) {
    console.error("Get jobs error:", error);

    res.status(500).json({
      message: "Failed to load jobs",
    });
  }
});
app.get("/jobs/:id", async (req, res) => {
  try {
    const jobId = req.params.id;

    const result = await pool.query(
      `SELECT
        jobs.id,
        jobs.title,
        jobs.company,
        jobs.location,
        jobs.description,
        jobs.salary,
        jobs.created_at,
        users.name AS author
       FROM jobs
       LEFT JOIN users ON jobs.user_id = users.id
       WHERE jobs.id = $1`,
      [jobId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    res.json({
      job: result.rows[0],
    });
  } catch (error) {
    console.error("Get job error:", error);

    res.status(500).json({
      message: "Failed to load job",
    });
  }
});

app.post("/jobs/:id/apply", authenticateToken, async (req, res) => {
  try {
    const jobId = req.params.id;
    const userId = req.user.id;

    const jobResult = await pool.query(
      `SELECT id
       FROM jobs
       WHERE id = $1`,
      [jobId]
    );

    if (jobResult.rows.length === 0) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    const result = await pool.query(
      `INSERT INTO applications (job_id, user_id, status)
       VALUES ($1, $2, 'pending')
       RETURNING
         id,
         job_id,
         user_id,
         status,
         created_at`,
      [jobId, userId]
    );

    res.status(201).json({
      message: "Application submitted successfully",
      application: result.rows[0],
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        message: "You have already applied for this job",
      });
    }

    console.error("Apply for job error:", error);

    res.status(500).json({
      message: "Failed to submit application",
    });
  }
});

app.get("/jobs/:id/applications", authenticateToken, async (req, res) => {
  try {
    const jobId = req.params.id;

    const result = await pool.query(
      `SELECT
        applications.id,
        applications.job_id,
        applications.user_id,
        applications.status,
        applications.created_at,
        users.name,
        users.email,
        users.job_title
       FROM applications
       JOIN users ON applications.user_id = users.id
       JOIN jobs ON applications.job_id = jobs.id
       WHERE applications.job_id = $1
         AND jobs.user_id = $2
       ORDER BY applications.created_at DESC`,
      [jobId, req.user.id]
    );

    res.json({
      applications: result.rows,
    });
  } catch (error) {
    console.error("Get applications error:", error);

    res.status(500).json({
      message: "Failed to load applications",
    });
  }
});

app.put("/applications/:id/status", authenticateToken, async (req, res) => {
  try {
    const applicationId = req.params.id;
    const { status } = req.body;

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({
        message: "Invalid application status",
      });
    }

    const result = await pool.query(
      `UPDATE applications
       SET status = $1
       FROM jobs
       WHERE applications.id = $2
         AND applications.job_id = jobs.id
         AND jobs.user_id = $3
       RETURNING
         applications.id,
         applications.job_id,
         applications.user_id,
         applications.status,
         applications.created_at`,
      [status, applicationId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Application not found",
      });
    }

    res.json({
      message: "Application status updated successfully",
      application: result.rows[0],
    });
  } catch (error) {
    console.error("Update application status error:", error);

    res.status(500).json({
      message: "Failed to update application status",
    });
  }
});

app.put("/applications/:id/withdraw", authenticateToken, async (req, res) => {
  try {
    const applicationId = req.params.id;

    const result = await pool.query(
      `UPDATE applications
       SET status = 'withdrawn'
       WHERE id = $1
         AND user_id = $2
         AND status IN ('pending', 'accepted')
       RETURNING
         id,
         job_id,
         user_id,
         status,
         created_at`,
      [applicationId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Application not found or cannot be withdrawn",
      });
    }

    res.json({
      message: "Application withdrawn successfully",
      application: result.rows[0],
    });
  } catch (error) {
    console.error("Withdraw application error:", error);

    res.status(500).json({
      message: "Failed to withdraw application",
    });
  }
});

app.put("/jobs/:id", authenticateToken, async (req, res) => {
  try {
    const jobId = req.params.id;

    const {
      title,
      company,
      location,
      description,
      salary,
    } = req.body;

    if (!title || !company) {
      return res.status(400).json({
        message: "Title and company are required",
      });
    }

    const result = await pool.query(
      `UPDATE jobs
       SET
         title = $1,
         company = $2,
         location = $3,
         description = $4,
         salary = $5
       WHERE id = $6 AND user_id = $7
       RETURNING id, title, company, location, description, salary, user_id, created_at`,
      [
        title,
        company,
        location || null,
        description || null,
        salary || null,
        jobId,
        req.user.id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Job not found or you are not the owner",
      });
    }

    res.json({
      message: "Job updated successfully",
      job: result.rows[0],
    });
  } catch (error) {
    console.error("Update job error:", error);

    res.status(500).json({
      message: "Failed to update job",
    });
  }
});

app.delete("/jobs/:id", authenticateToken, async (req, res) => {
  try {
    const jobId = req.params.id;

    const result = await pool.query(
      `DELETE FROM jobs
       WHERE id = $1 AND user_id = $2
       RETURNING id, title, company`,
      [jobId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Job not found or you are not the owner",
      });
    }

    res.json({
      message: "Job deleted successfully",
      job: result.rows[0],
    });
  } catch (error) {
    console.error("Delete job error:", error);

    res.status(500).json({
      message: "Failed to delete job",
    });
  }
});
app.get("/locations/search", async (req, res) => {
  try {
    const text = req.query.text?.trim();

    if (!text || text.length < 2) {
      return res.json({
        cities: [],
      });
    }

    const url = new URL(
      "https://api.geoapify.com/v1/geocode/autocomplete"
    );

    url.searchParams.set("text", text);
    url.searchParams.set("type", "city");
    url.searchParams.set("limit", "5");
    url.searchParams.set("apiKey", process.env.GEOAPIFY_API_KEY);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Geoapify error: ${response.status}`);
    }

    const data = await response.json();

    const cities = data.features.map((feature) => ({
      name: feature.properties.city || feature.properties.name,
      country: feature.properties.country,
      formatted: feature.properties.formatted,
    }));

    res.json({ cities });
  } catch (error) {
    console.error("Location search error:", error);

    res.status(500).json({
      message: "Failed to search locations",
    });
  }
});


app.listen(PORT, () => {
  console.log(`Job Portal API running on http://localhost:${PORT}`);
});
