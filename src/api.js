const BASE = "/api/notes";

export const getNotes = async (q = "") => {
  const url = q ? `${BASE}?q=${encodeURIComponent(q)}` : BASE;
  const res = await fetch(url);
  return res.json();
};

export const createNote = async (data) => {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const updateNote = async (id, data) => {
  const res = await fetch(`${BASE}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const deleteNote = async (id) => {
  await fetch(`${BASE}/${id}`, { method: "DELETE" });
};
