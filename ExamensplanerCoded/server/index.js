import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";
import pdfParse from "pdf-parse";
import OpenAI from "openai";

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
const PORT = Number(process.env.PORT || 8787);

app.use(cors());
app.use(express.json({ limit: "1mb" }));

function mockStructuredResult(subject, topic, textPreview = "") {
  const hint = textPreview ? ` (Auszug: ${textPreview.slice(0, 120)}...)` : "";
  return {
    summary: `Mock-Zusammenfassung zu ${subject} / ${topic}${hint}`,
    flashcards: [
      { front: "Definition", back: "Wichtiger Kernbegriff aus dem Dokument." },
      { front: "Pruefungspunkt 1", back: "Erster Schritt im Pruefungsaufbau." },
      { front: "Pruefungspunkt 2", back: "Abgrenzung und typische Fehlerquelle." },
    ],
    quizQuestions: [
      {
        question: "Welche Voraussetzung pruefst du zuerst?",
        options: ["Tatbestand", "Zulaessigkeit", "Begruendetheit", "Rechtsfolge"],
        answer: "Zulaessigkeit",
      },
      {
        question: "Welche Aussage passt zum Dokumentinhalt am besten?",
        options: ["Schema ist entbehrlich", "Subsumtion ist zentral", "Definitionen sind unwichtig", "Aufbau ist beliebig"],
        answer: "Subsumtion ist zentral",
      },
    ],
    openQuestions: [
      "Welche Argumente sprechen fuer die Gegenansicht?",
      "Wo liegt die wichtigste Abgrenzung im Fall?",
      "Welche Pruefungsreihenfolge ist klausurtaktisch sinnvoll?",
    ],
    examSchemas: [
      {
        title: "Erkanntes Pruefungsschema",
        steps: ["Zulaessigkeit", "Begruendetheit", "Ergebnis"],
      },
    ],
  };
}

app.post("/api/analyze-document", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    const subject = req.body.subject || "Unbekanntes Rechtsgebiet";
    const topic = req.body.topic || "Unbekanntes Thema";

    if (!file) {
      return res.status(400).json({ error: "Keine PDF-Datei hochgeladen." });
    }

    const parsed = await pdfParse(file.buffer);
    const rawText = (parsed.text || "").replace(/\s+/g, " ").trim();
    const text = rawText.slice(0, 24000);

    if (!text) {
      return res.status(400).json({ error: "Die PDF enthaelt keinen auslesbaren Text." });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.json({
        data: mockStructuredResult(subject, topic, text),
        meta: { source: "mock", reason: "OPENAI_API_KEY fehlt" },
      });
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const prompt = `
Analysiere den folgenden juristischen Lerntext und gib NUR valides JSON im folgenden Format zurueck:
{
  "summary": "string",
  "flashcards": [{"front":"string","back":"string"}],
  "quizQuestions": [{"question":"string","options":["string","string","string","string"],"answer":"string"}],
  "openQuestions": ["string"],
  "examSchemas": [{"title":"string","steps":["string"]}]
}

Rechtsgebiet: ${subject}
Thema: ${topic}

Text:
${text}
`;

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
      temperature: 0.2,
    });

    const content = response.output_text?.trim() || "";
    let structured;
    try {
      structured = JSON.parse(content);
    } catch {
      structured = mockStructuredResult(subject, topic, text);
    }

    return res.json({
      data: structured,
      meta: { source: "openai" },
    });
  } catch (error) {
    return res.status(500).json({
      error: "Analyse fehlgeschlagen.",
      details: error instanceof Error ? error.message : "Unbekannter Fehler",
    });
  }
});

app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
});
