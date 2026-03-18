import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3001;
const DB_FILE = path.join(__dirname, "notes.json");

app.use(cors());
app.use(express.json());

const readNotes = () => {
  if (!fs.existsSync(DB_FILE)) return [];
  return JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
};
const writeNotes = (notes) =>
  fs.writeFileSync(DB_FILE, JSON.stringify(notes, null, 2));

// GET all / search
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

// GET one
app.get("/api/notes/:id", (req, res) => {
  const note = readNotes().find((n) => n.id === req.params.id);
  if (!note) return res.status(404).json({ error: "Not found" });
  res.json(note);
});

// POST create
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

// PATCH update
app.patch("/api/notes/:id", (req, res) => {
  const notes = readNotes();
  const idx = notes.findIndex((n) => n.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  notes[idx] = { ...notes[idx], ...req.body, updatedAt: new Date().toISOString() };
  writeNotes(notes);
  res.json(notes[idx]);
});

// DELETE
app.delete("/api/notes/:id", (req, res) => {
  const notes = readNotes().filter((n) => n.id !== req.params.id);
  writeNotes(notes);
  res.json({ ok: true });
});

app.listen(PORT, () =>
  console.log(`Notes API running on http://localhost:${PORT}`)
);
