import express from "express";
import fs from "fs";
import cors from "cors";
import nodemailer from "nodemailer";
import bodyParser from "body-parser";
import { EMAIL_USER, EMAIL_PASS } from "./config.js";

const app = express();
app.use(cors());
app.use(bodyParser.json());

const USERS_FILE = "./users.json";

function loadUsers() {
  return fs.existsSync(USERS_FILE) ? JSON.parse(fs.readFileSync(USERS_FILE)) : [];
}

function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

// --- Signup ---
app.post("/signup", (req, res) => {
  const { username, email, password } = req.body;
  const users = loadUsers();
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: "هذا الإيميل موجود بالفعل." });
  }

  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  users.push({ username, email, password, verified: false, verificationCode });
  saveUsers(users);

  transporter.sendMail({
    from: EMAIL_USER,
    to: email,
    subject: "رمز التحقق لـKazuma TV.",
    text: `رمز التحقق الخاص بك هو: ${verificationCode}`,
  });

  res.json({ message: "تم إرسال رمز التحقق!" });
});

// --- Verify ---
app.post("/verify", (req, res) => {
  const { email, code } = req.body;
  const users = loadUsers();
  const user = users.find(u => u.email === email);
  if (!user) return res.status(404).json({ error: "لم يتم إيجاد المستخدم." });
  if (user.verificationCode !== code) return res.status(400).json({ error: "رمز خاطئ." });

  user.verified = true;
  delete user.verificationCode;
  saveUsers(users);
  res.json({ message: "تم إنشاء الحساب!" });
});

// --- Login ---
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const users = loadUsers();
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ error: "بيانات خاطئة." });
  if (!user.verified) return res.status(403).json({ error: "رجاءاً قم بإرسال رمز التحقق أولاً." });
  res.json({ message: "تم تسجيل الدخول", username: user.username });
});

// --- Forgot password ---
app.post("/forgot", (req, res) => {
  const { email } = req.body;
  const users = loadUsers();
  const user = users.find(u => u.email === email);
  if (!user) return res.status(404).json({ error: "لم يتم إيجاد المستخدم." });

  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  user.resetCode = resetCode;
  saveUsers(users);

  transporter.sendMail({
    from: EMAIL_USER,
    to: email,
    subject: "إسترجاع كلمة مرور الحساب في Kazuma TV",
    text: `رمز استرجاع كلمة المرور في Kazuma TV: ${resetCode}`,
  });

  res.json({ message: "تم إرسال رمز الإسترجاع!" });
});

// --- Reset password ---
app.post("/reset", (req, res) => {
  const { email, code, newPassword } = req.body;
  const users = loadUsers();
  const user = users.find(u => u.email === email && u.resetCode === code);
  if (!user) return res.status(400).json({ error: "رمز إسترجاع خاطئ." });

  user.password = newPassword;
  delete user.resetCode;
  saveUsers(users);

  res.json({ message: "تم استرجاع كلمة المرور!" });
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));