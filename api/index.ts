import express from "express";
import path from "path";
import multer from "multer";
import pdf from "pdf-parse";
import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Increase payload limits for large PDFs
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

// AI Extraction Route
// @ts-ignore
app.post("/api/extract", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ detail: "No file uploaded" });
  }

  if (!groq) {
    return res.status(500).json({ detail: "GROQ_API_KEY not configured" });
  }

  try {
    const pdfData = await pdf(req.file.buffer);
    const text = pdfData.text;

    const prompt = `
      You are a legal document analyzer. Extract structured JSON data from the following text of an Articles of Incorporation (AOI) or Articles of Partnership document.
      Ensure the response is ONLY a JSON object and nothing else.
      
      Fields to extract:
      - name / corporateName / partnershipName: (String)
      - tradeNames: (Array of Strings)
      - primaryPurpose: (String)
      - secondaryPurposes: (String)
      - street: (String)
      - barangay: (String)
      - city: (String)
      - province: (String)
      - zip: (String)
      - term: (String, '0' for perpetual)
      - numberOfDirectors: (String)
      - acsWords / totalCapitalWords: (String, ALL CAPS)
      - acsAmount / totalCapitalAmount / acsAmountNum: (String, numbers only, strip currency symbols like P, PHP, ₱)
      - numberOfShares: (String, with commas)
      - parValue: (String)
      - generalManager: (String)
      - treasurer: (String)
      - treasurerTIN: (String)
      - treasurerAddress: (String)
      - treasurerCitizenship: (String)
      - secRegistrationNo: (String)
      - dateOfRegistration: (String, YYYY-MM-DD)
      - article1AmendedDate: (String, YYYY-MM-DD)
      - documentAmendedDate: (String, YYYY-MM-DD)
      - incorporators / partners: (Array of {name, nationality, residence})
      - directors: (Array of {name, nationality, residence})
      - subscribers / contributions: (Array of {name, citizenship, sharesSubscribed, amountSubscribed, amountPaid, amountContributed, amount})
      - signatories: (Array of {name, role, tin})

      IMPORTANT RULES FOR DATA EXTRACTION:
      1. **NAME RECONSTRUCTION (CRITICAL)**: PDF conversion often splits a single person's name across 2-4 lines. You MUST look ahead at subsequent lines. If a line just contains a suffix (like "SADSAD-TAMESIS"), a middle name, or a second surname, it is the SAME person. Join them with a space into one single "name" string. 
         - **Example**: If PDF text says "KATHRINA MISHAEL CHISWELL" on line 1 and "SADSAD-TAMESIS" on line 2, return "KATHRINA MISHAEL CHISWELL SADSAD-TAMESIS" as a single name.
      2. **HYPHENATED NAMES**: Never split a hyphenated name (e.g., "SADSAD-TAMESIS"). They are always part of the same person.
      3. **TABLE RECOGNITION**: PDF tables often result in "ghost" rows where one person's name spans two lines and the second line has empty nationality/residence. You MUST detect these and merge them.
      4. **AGGRESSIVE MERGING**: It is better to return a slightly longer name than to split one person into two. If the address or nationality is missing for a "new" person detected on the next line, it is almost certainly a continuation of the previous name.
      5. **NATIONALITY**: Normalize "Filipino", "Philippine", "Philippine-Filipino" etc. to "FILIPINO".
      6. **ADDRESSES**: Reconstruct multi-line addresses into a single string.
      7. **PURPOSES (VERBATIM - CRITICAL)**: 
         - **Extraction**: You MUST extract "primaryPurpose" and "secondaryPurposes" EXACTLY word-for-word. DO NOT summarize, shorten, or paraphrase.
         - **Separation Logic**: 
           - **PRIMARY PURPOSE**: Extract the text that follows "Primary Purpose:" up until you hit a transition marker.
           - **SECONDARY TRANSITION**: If you see the phrase "In pursuit of its primary purpose, the Partnership shall also engage in the following:" (or any text starting with "In pursuit of..."), that phrase AND everything after it MUST be put into the "secondaryPurposes" field.
           - DO NOT leave the "In pursuit of..." transition phrase inside the "primaryPurpose" field. It marks the start of the secondary purposes.
           - If there are numbered items (1, 2, 3...) follow the transition, capture EVERY ONE of them verbatim with their full descriptions.
      8. **JSON STRUCTURE**: Return an object with these exact keys:
         - name: (The corporate/partnership name)
         - tradeNames: (Array of strings)
         - formerlyName: (String)
         - formerlyTradeNames: (Array of strings)
         - primaryPurpose: (String)
         - secondaryPurposes: (String)
         - street, brgy, city, prov, zip: (Strings)
         - term: (Number or String)
         - amountWords, amountNum: (Capital amount)
         - partners: (Array of {name, nationality, residence})
         - incorporators: (Array of {name, nationality, residence})
         - directors: (Array of {name, nationality, residence})
         - contributions / subscribers: (Array of {name, amount, shares, paid})
         - signatories: (Array of {name, tin, role})
         - meetingDate: (String, YYYY-MM-DD or null)
         - article1AmendedDate, article2AmendedDate, etc: (Strings)

      PDF TEXT:
      ${text.substring(0, 50000)}
    `;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
    }).catch(err => {
      console.error("Groq API Error:", err);
      if (err.status === 401) {
        throw new Error("GROQ AUTH FAILED: Your API key is invalid or duplicated. Please check your settings.");
      }
      throw new Error(err.message || "Groq API request failed");
    });

    const result = JSON.parse(completion.choices[0].message.content || "{}");
    res.json(result);
  } catch (error: any) {
    console.error("Extraction error:", error);
    res.status(500).json({ detail: error.message || "Failed to extract data" });
  }
});

// Serve static files if any
app.use("/static", express.static(path.join(process.cwd(), "static")));

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  }
}

export default app;

if (process.env.NODE_ENV !== "test") {
  startServer();
}
