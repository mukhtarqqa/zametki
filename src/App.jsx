import { useState, useEffect, useRef } from "react";
import { getNotes, createNote, updateNote, deleteNote } from "./api";

const COLORS = [
  { hex: "#ffffff", label: "Белый" },
  { hex: "#fef9c3", label: "Жёлтый" },
  { hex: "#dcfce7", label: "Зелёный" },
  { hex: "#dbeafe", label: "Синий" },
  { hex: "#fce7f3", label: "Розовый" },
  { hex: "#ede9fe", label: "Фиолетовый" },
  { hex: "#ffedd5", label: "Оранжевый" },
  { hex: "#f1f5f9", label: "Серый" },
];

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const css = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Sans:wght@300;400;500&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg: #1a1814;
  --surface: #222018;
  --card: #2b2720;
  --accent: #e8c97e;
  --accent2: #c9a84c;
  --text: #f2ead8;
  --text2: #9a9080;
  --border: #38322a;
  --red: #d97070;
}

body { font-family: 'DM Sans', sans-serif; background: var(--bg); color: var(--text); min-height: 100vh; }

.app { display: flex; height: 100vh; overflow: hidden; }

/* ── Sidebar ── */
.sidebar {
  width: 272px; min-width: 272px;
  background: var(--surface);
  border-right: 1px solid var(--border);
  display: flex; flex-direction: column;
  padding: 20px 14px; gap: 6px;
}

.logo {
  font-family: 'Playfair Display', serif;
  font-size: 20px; color: var(--accent);
  padding: 0 6px 16px;
  border-bottom: 1px solid var(--border);
  letter-spacing: .3px;
}

.new-btn {
  width: 100%; padding: 11px;
  background: var(--accent); color: #1a1814;
  border: none; border-radius: 10px;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px; font-weight: 500;
  cursor: pointer; margin: 10px 0;
  transition: background .15s, transform .15s;
}
.new-btn:hover { background: var(--accent2); transform: translateY(-1px); }

.search-wrap { position: relative; }
.search-wrap input {
  width: 100%; padding: 9px 12px 9px 34px;
  background: var(--card); border: 1px solid var(--border);
  border-radius: 9px; color: var(--text);
  font-family: 'DM Sans', sans-serif; font-size: 13px; outline: none;
  transition: border-color .15s;
}
.search-wrap input:focus { border-color: var(--accent); }
.search-wrap input::placeholder { color: var(--text2); }
.search-icon {
  position: absolute; left: 10px; top: 50%;
  transform: translateY(-50%);
  color: var(--text2); font-size: 13px; pointer-events: none;
}

.note-list {
  flex: 1; overflow-y: auto;
  display: flex; flex-direction: column; gap: 3px;
  margin-top: 6px;
}
.note-list::-webkit-scrollbar { width: 3px; }
.note-list::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }

.section-label {
  font-size: 10px; color: var(--text2);
  text-transform: uppercase; letter-spacing: 1px;
  padding: 8px 8px 3px;
  display: flex; align-items: center; justify-content: space-between;
}
.count { font-size: 10px; background: var(--border); color: var(--text2); padding: 1px 6px; border-radius: 20px; }

.note-item {
  padding: 11px 12px; border-radius: 9px; cursor: pointer;
  border: 1px solid transparent;
  transition: background .12s, border-color .12s;
  animation: fadeIn .18s ease;
}
.note-item:hover { background: var(--card); border-color: var(--border); }
.note-item.active { background: var(--card); border-color: var(--accent); }
.ni-header { display: flex; align-items: center; justify-content: space-between; gap: 6px; }
.ni-title { font-size: 13px; font-weight: 500; color: var(--text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; }
.ni-pin { font-size: 10px; color: var(--accent); flex-shrink: 0; }
.ni-preview { font-size: 11px; color: var(--text2); margin-top: 3px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ni-date { font-size: 10px; color: var(--text2); margin-top: 4px; opacity: .6; }

/* ── Main ── */
.main { flex: 1; display: flex; flex-direction: column; overflow: hidden; position: relative; }

.note-tint { position: absolute; inset: 0; pointer-events: none; opacity: .05; transition: background .3s; z-index: 0; }
.main > *:not(.note-tint) { position: relative; z-index: 1; }

.toolbar {
  padding: 18px 28px; border-bottom: 1px solid var(--border);
  display: flex; align-items: center; gap: 10px; flex-shrink: 0;
}
.meta { font-size: 11px; color: var(--text2); display: flex; gap: 14px; }
.toolbar-actions { margin-left: auto; display: flex; gap: 6px; }

.tb-btn {
  padding: 7px 13px; border-radius: 8px;
  border: 1px solid var(--border);
  background: transparent; color: var(--text2);
  cursor: pointer; font-size: 12px; font-family: 'DM Sans', sans-serif;
  transition: background .12s, color .12s, border-color .12s;
  display: flex; align-items: center; gap: 5px;
}
.tb-btn:hover { background: var(--card); color: var(--text); }
.tb-btn.active { color: var(--accent); border-color: var(--accent); }
.tb-btn.danger:hover { border-color: var(--red); color: var(--red); }

.color-bar { display: flex; align-items: center; gap: 6px; }
.color-label { font-size: 11px; color: var(--text2); margin-right: 2px; }
.cp-dot {
  width: 22px; height: 22px; border-radius: 50%; cursor: pointer;
  border: 2px solid transparent; transition: transform .12s, border-color .12s;
  flex-shrink: 0;
}
.cp-dot:hover { transform: scale(1.15); border-color: rgba(255,255,255,.4); }
.cp-dot.sel { border-color: var(--accent); transform: scale(1.18); box-shadow: 0 0 0 2px rgba(232,201,126,.3); }

/* ── Editor ── */
.editor-area { flex: 1; overflow-y: auto; padding: 28px 32px; display: flex; flex-direction: column; gap: 18px; }
.editor-area::-webkit-scrollbar { width: 5px; }
.editor-area::-webkit-scrollbar-thumb { background: var(--border); border-radius: 5px; }

.title-input {
  width: 100%; background: transparent; border: none; outline: none;
  font-family: 'Playfair Display', serif; font-size: 30px; font-weight: 700;
  color: var(--text); line-height: 1.2; resize: none; overflow: hidden;
}
.title-input::placeholder { color: var(--text2); }

.divider { border: none; border-top: 1px solid var(--border); }

.body-input {
  width: 100%; min-height: 380px; background: transparent; border: none; outline: none;
  font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 300;
  color: var(--text); line-height: 1.85; resize: none;
}
.body-input::placeholder { color: var(--text2); }

/* ── Empty ── */
.empty {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 12px; opacity: .4;
}
.empty-icon { font-size: 48px; }
.empty h2 { font-family: 'Playfair Display', serif; font-size: 22px; }
.empty p { font-size: 13px; color: var(--text2); }

.no-results { padding: 14px 8px; color: var(--text2); font-size: 12px; }

@keyframes fadeIn { from { opacity: 0; transform: translateY(3px); } to { opacity: 1; } }
`;

export default function App() {
  const [notes, setNotes] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const saveTimer = useRef(null);

  const load = async (q = "") => {
    const data = await getNotes(q);
    setNotes(data);
    return data;
  };

  useEffect(() => {
    load().then((data) => {
      setLoading(false);
      if (data.length > 0) openNote(data[0]);
    });
  }, []);

  useEffect(() => {
    const t = setTimeout(() => load(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const openNote = (note) => {
    setActiveId(note.id);
    setTitle(note.title);
    setBody(note.body);
    setColor(note.color || COLORS[0].hex);
  };

  const handleNew = async () => {
    const note = await createNote({
      title: "Без названия",
      body: "",
      color: COLORS[Math.floor(Math.random() * COLORS.length)].hex,
    });
    await load(search);
    openNote(note);
  };

  const handleChange = (field, val) => {
    if (field === "title") setTitle(val);
    else setBody(val);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      if (!activeId) return;
      await updateNote(activeId, {
        title: field === "title" ? val : title,
        body: field === "body" ? val : body,
      });
      load(search);
    }, 500);
  };

  const handleColorChange = async (c) => {
    setColor(c);
    setShowColors(false);
    if (!activeId) return;
    await updateNote(activeId, { color: c });
    load(search);
  };

  const handleDelete = async () => {
    if (!activeId) return;
    await deleteNote(activeId);
    const remaining = await load(search);
    if (remaining.length > 0) openNote(remaining[0]);
    else { setActiveId(null); setTitle(""); setBody(""); }
  };

  const handlePin = async () => {
    if (!activeId) return;
    const note = notes.find((n) => n.id === activeId);
    await updateNote(activeId, { pinned: !note.pinned });
    load(search);
  };

  const pinned = notes.filter((n) => n.pinned);
  const unpinned = notes.filter((n) => !n.pinned);
  const activeNote = notes.find((n) => n.id === activeId);

  return (
    <>
      <style>{css}</style>
      <div className="app">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="logo">Заметки</div>
          <button className="new-btn" onClick={handleNew}>+ Новая заметка</button>

          <div className="search-wrap">
            <span className="search-icon">⌕</span>
            <input
              placeholder="Поиск..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="note-list">
            {loading && <div className="no-results">Загрузка...</div>}

            {pinned.length > 0 && (
              <>
                <div className="section-label">
                  Закреплённые <span className="count">{pinned.length}</span>
                </div>
                {pinned.map((n) => (
                  <NoteItem key={n.id} note={n} active={activeId === n.id} onClick={() => openNote(n)} />
                ))}
              </>
            )}

            {unpinned.length > 0 && (
              <>
                {pinned.length > 0 && (
                  <div className="section-label">
                    Все <span className="count">{unpinned.length}</span>
                  </div>
                )}
                {unpinned.map((n) => (
                  <NoteItem key={n.id} note={n} active={activeId === n.id} onClick={() => openNote(n)} />
                ))}
              </>
            )}

            {!loading && notes.length === 0 && (
              <div className="no-results">Заметки не найдены</div>
            )}
          </div>
        </aside>

        {/* Main */}
        <main className="main">
          <div className="note-tint" style={{ background: color }} />

          {!activeId ? (
            <div className="empty">
              <div className="empty-icon">◻</div>
              <h2>Нет заметок</h2>
              <p>Нажмите «+ Новая заметка» чтобы начать</p>
            </div>
          ) : (
            <>
              <div className="toolbar">
                <div className="toolbar-actions">
                  <div className="color-bar">
                    <span className="color-label">Цвет:</span>
                    {COLORS.map((c) => (
                      <div
                        key={c.hex}
                        className={`cp-dot${color === c.hex ? " sel" : ""}`}
                        style={{ background: c.hex }}
                        title={c.label}
                        onClick={() => handleColorChange(c.hex)}
                      />
                    ))}
                  </div>

                  <button
                    className={`tb-btn${activeNote?.pinned ? " active" : ""}`}
                    onClick={handlePin}
                  >
                    {activeNote?.pinned ? "Открепить" : "Закрепить"}
                  </button>

                  <button className="tb-btn danger" onClick={handleDelete}>
                    Удалить
                  </button>
                </div>
              </div>

              <div className="editor-area">
                <textarea
                  className="title-input"
                  placeholder="Заголовок..."
                  value={title}
                  rows={1}
                  onChange={(e) => handleChange("title", e.target.value)}
                  onInput={(e) => {
                    e.target.style.height = "auto";
                    e.target.style.height = e.target.scrollHeight + "px";
                  }}
                />
                <hr className="divider" />
                <textarea
                  className="body-input"
                  placeholder="Начните писать..."
                  value={body}
                  onChange={(e) => handleChange("body", e.target.value)}
                />
              </div>
            </>
          )}
        </main>
      </div>
    </>
  );
}

function NoteItem({ note, active, onClick }) {
  return (
    <div className={`note-item${active ? " active" : ""}`} onClick={onClick}>
      <div className="ni-header">
        <div className="ni-title">{note.title || "Без названия"}</div>
        {note.pinned && <span className="ni-pin">●</span>}
      </div>
      <div className="ni-preview">{note.body || "Пустая заметка"}</div>
      <div className="ni-date">{formatDate(note.updatedAt)}</div>
    </div>
  );
}
