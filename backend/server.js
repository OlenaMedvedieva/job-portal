require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");

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
    const { name, email, password } = req.body;

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

    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, created_at`,
      [name, email, passwordHash]
    );

    res.status(201).json({
      message: "User registered successfully",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Registration error:", error);

    res.status(500).json({
      message: "Registration failed",
    });
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
      "SELECT id, name, email, password_hash FROM users WHERE email = $1",
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
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      message: "Login failed",
    });
  }
});

app.get("/profile", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, created_at FROM users WHERE id = $1",
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


app.listen(PORT, () => {
  console.log(`Job Portal API running on http://localhost:${PORT}`);
});
