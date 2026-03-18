import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Render үшін портты автоматты түрде алу, әйтпесе 3001
const PORT = process.env.PORT || 3001; 
const DB_FILE = path.join(__dirname, "notes.json");

app.use(cors());
app.use(express.json());

// 1. React-тің дайын файлдарын (dist) интернетке шығару
app.use(express.static(path.join(__dirname, "dist")));

const readNotes = () => {
  if (!fs.existsSync(DB_FILE)) return [];
  try {
    const data = fs.readFileSync(DB_FILE, "utf-8");
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

const writeNotes = (notes) =>
  fs.writeFileSync(DB_FILE, JSON.stringify(notes, null, 2));

// --- API ЭНДПОИНТТАРЫ ---

// GET: Барлық жазбаларды алу
app.get("/api/notes", (req, res) => {
  let notes = readNotes();
  const { q } = req.query;
  if (q) {
    const lc = q.toLowerCase();
    notes = notes.filter(
      (n) =>
        n.title.toLowerCase().includes(lc) ||
        n.body.toLowerCase().includes(lc)
    );
  }
  res.json(notes);
});

// POST: Жаңа жазба қосу
app.post("/api/notes", (req, res) => {
  const { title = "Без названия", body = "", color = "#f9f3e3" } = req.body;
  const note = {
    id: uuidv4(),
    title,
    body,
    color,
    pinned: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const notes = readNotes();
  notes.unshift(note);
  writeNotes(notes);
  res.status(201).json(note);
});

// PATCH: Жазбаны өзгерту
app.patch("/api/notes/:id", (req, res) => {
  const notes = readNotes();
  const idx = notes.findIndex((n) => n.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  notes[idx] = { ...notes[idx], ...req.body, updatedAt: new Date().toISOString() };
  writeNotes(notes);
  res.json(notes[idx]);
});

// DELETE: Жазбаны өшіру
app.delete("/api/notes/:id", (req, res) => {
  const notes = readNotes().filter((n) => n.id !== req.params.id);
  writeNotes(notes);
  res.json({ ok: true });
});

// 2. БАРЛЫҚ БАСҚА СҰРАНЫСТАРДЫ REACT-КЕ БАҒЫТТАУ
// Бұл сайтты жаңартқанда (Refresh) қате шықпауы үшін керек
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);