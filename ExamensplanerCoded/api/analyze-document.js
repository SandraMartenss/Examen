import fs from "node:fs/promises";
import pdfParse from "pdf-parse";
import OpenAI from "openai";
import formidable from "formidable";

export const config = {
  api: {
    bodyParser: false,
  },
};

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
        options: [
          "Schema ist entbehrlich",
          "Subsumtion ist zentral",
          "Definitionen sind unwichtig",
          "Aufbau ist beliebig",
        ],
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

function normalizeStructuredResult(data, subject, topic, text) {
  const fallback = mockStructuredResult(subject, topic, text);
  if (!data || typeof data !== "object") return fallback;

  return {
    summary:
      typeof data.summary === "string" && data.summary.trim()
        ? data.summary
        : fallback.summary,
    flashcards: Array.isArray(data.flashcards) ? data.flashcards : fallback.flashcards,
    quizQuestions: Array.isArray(data.quizQuestions) ? data.quizQuestions : fallback.quizQuestions,
    openQuestions: Array.isArray(data.openQuestions) ? data.openQuestions : fallback.openQuestions,
    examSchemas: Array.isArray(data.examSchemas) ? data.examSchemas : fallback.examSchemas,
  };
}

function parseMultipart(req) {
  const form = formidable({
    multiples: false,
    keepExtensions: true,
  });

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
}

function firstValue(value) {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(400).json({ error: "Nur POST ist erlaubt." });
  }

  try {
    const { fields, files } = await parseMultipart(req);

    const subject = firstValue(fields.subject) || "Unbekanntes Rechtsgebiet";
    const topic = firstValue(fields.topic) || "Unbekanntes Thema";
    const uploaded = firstValue(files.file);

    if (!uploaded) {
      return res.status(400).json({ error: "Keine PDF-Datei hochgeladen." });
    }

    const mimetype = uploaded.mimetype || "";
    const originalName = uploaded.originalFilename || "";
    const looksLikePdf =
      mimetype === "application/pdf" || originalName.toLowerCase().endsWith(".pdf");

    if (!looksLikePdf) {
      return res.status(400).json({ error: "Nur PDF-Dateien sind erlaubt." });
    }

    const fileBuffer = await fs.readFile(uploaded.filepath);
    const parsed = await pdfParse(fileBuffer);
    const rawText = (parsed.text || "").replace(/\s+/g, " ").trim();
    const text = rawText.slice(0, 24000);

    if (!text) {
      return res.status(400).json({ error: "Die PDF enthaelt keinen auslesbaren Text." });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(200).json({
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
    let source = "openai";
    try {
      structured = JSON.parse(content);
    } catch {
      structured = mockStructuredResult(subject, topic, text);
      source = "mock";
    }

    return res.status(200).json({
      data: normalizeStructuredResult(structured, subject, topic, text),
      meta: { source },
    });
  } catch (error) {
    return res.status(500).json({
      error: "Analyse fehlgeschlagen.",
      details: error instanceof Error ? error.message : "Unbekannter Fehler",
    });
  }
}
