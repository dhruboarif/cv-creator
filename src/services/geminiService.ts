import type { CVData } from '../types';

export interface ScanDocumentInput {
    fileData: string; // base64 string (with data:mime/type;base64, prefix)
    mimeType: string;
    name?: string;
}

export interface ExtractedCVData {
    personal?: Partial<CVData['personal']>;
    education?: CVData['education'];
    experience?: CVData['experience'];
    careerObjective?: string;
}

export interface GeminiModelInfo {
    name: string;
    displayName: string;
}

export async function getAvailableModels(apiKey: string): Promise<GeminiModelInfo[]> {
    if (!apiKey?.trim()) return [];
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey.trim()}`);
        if (!response.ok) return [];
        const data = await response.json();
        
        const validModels = (data.models || []).filter((m: any) => 
            m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent')
        );
        
        return validModels.map((m: any) => ({
            name: m.name.replace('models/', ''),
            displayName: m.displayName || m.name.replace('models/', '')
        }));
    } catch (e) {
        return [];
    }
}


const PROMPT = `
You are an expert OCR & Document Parser specializing in Bangladeshi documents (NID Card, Birth Registration, SSC/HSC/Degree Marksheets, Certificates, Experience Letters).

Extract ALL available information from the provided documents and return ONLY a valid JSON object (no markdown, no \`\`\`json wrappers) with this structure:

{
  "personal": {
    "name": "Full Name in English",
    "fatherName": "Father's Name",
    "motherName": "Mother's Name",
    "dob": "Date of Birth (e.g. 05 March 2000)",
    "nid": "NID or Birth Registration Number",
    "nationality": "Bangladeshi",
    "religion": "Religion if mentioned",
    "gender": "Male or Female",
    "maritalStatus": "Single or Married",
    "bloodGroup": "e.g. B(+)",
    "address": "Present Address",
    "permanentAddress": "Permanent Address"
  },
  "education": [
    {
      "degree": "Exam name (S.S.C / H.S.C / B.Sc etc.)",
      "institution": "School/College/University",
      "board": "Board name",
      "group": "Group/Major (Science/Arts/Commerce/CSE etc.)",
      "passingYear": "e.g. 2018",
      "result": "GPA or Division"
    }
  ],
  "experience": [
    {
      "title": "Job Designation",
      "company": "Organization Name",
      "duration": "Duration e.g. 2021-2023",
      "responsibilities": ["key responsibility 1", "key responsibility 2"]
    }
  ],
  "careerObjective": "Brief objective based on credentials"
}

Rules:
- Translate Bengali to English where needed
- If a field is not found, use empty string ""
- Return ONLY valid JSON, nothing else
`;

// ─── Compress image using canvas ───────────────────────────────────────────────
async function compressImageBase64(
    base64: string,
    mimeType: string,
    maxWidthPx = 1600,
    qualityJpeg = 0.82
): Promise<string> {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            let { width, height } = img;
            if (width > maxWidthPx) {
                height = Math.round((height * maxWidthPx) / width);
                width = maxWidthPx;
            }
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d')!;
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL(
                mimeType === 'image/png' ? 'image/png' : 'image/jpeg',
                qualityJpeg
            );
            resolve(compressed);
        };
        img.onerror = () => resolve(base64); // fallback: use original
        img.src = base64;
    });
}

// ─── Main Document Parser ──────────────────────────────────────────────────────
export async function parseDocumentsWithGemini(
    documents: ScanDocumentInput[],
    apiKey: string,
    model: string = 'gemini-2.0-flash',
    onProgress?: (msg: string) => void
): Promise<ExtractedCVData> {
    if (!apiKey?.trim()) {
        throw new Error('দয়া করে আপনার Gemini API Key দিন।');
    }
    if (documents.length === 0) {
        throw new Error('অন্তত একটি ডকুমেন্ট দিন।');
    }

    const parts: any[] = [{ text: PROMPT }];

    // Process each document
    for (let i = 0; i < documents.length; i++) {
        const doc = documents[i];
        onProgress?.(`ডকুমেন্ট ${i + 1}/${documents.length} প্রস্তুত হচ্ছে...`);

        const isPDF = doc.mimeType === 'application/pdf';
        let fileData = doc.fileData;

        if (!isPDF) {
            // Compress image before sending
            onProgress?.(`ডকুমেন্ট ${i + 1}/${documents.length} অপ্টিমাইজ হচ্ছে...`);
            fileData = await compressImageBase64(fileData, doc.mimeType);
        }

        // Strip data URI prefix to get raw base64
        const base64Only = fileData.includes('base64,')
            ? fileData.split('base64,')[1]
            : fileData;

        parts.push({
            inline_data: {
                mime_type: isPDF ? 'application/pdf' : (doc.mimeType.startsWith('image/') ? doc.mimeType : 'image/jpeg'),
                data: base64Only,
            }
        });
    }

    onProgress?.('Gemini AI দিয়ে তথ্য বিশ্লেষণ হচ্ছে...');

    // 3 minute timeout for generate call
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 180000);

    const GEMINI_GENERATE_URL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

    try {
        const response = await fetch(`${GEMINI_GENERATE_URL}?key=${apiKey.trim()}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts }],
                generationConfig: {
                    temperature: 0.1,
                    topP: 0.95,
                    maxOutputTokens: 2048,
                    responseMimeType: "application/json",
                },
            }),
            signal: controller.signal,
        });
        clearTimeout(timeout);

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            const msg = errData?.error?.message || `API Error (${response.status})`;

            // Friendly error messages
            if (response.status === 400 && msg.includes('size')) {
                throw new Error('ফাইলটি অনেক বড়। PDF এর পরিবর্তে স্ক্রিনশট বা ছবি (JPG/PNG) আপলোড করে চেষ্টা করুন।');
            }
            if (response.status === 403 || response.status === 401) {
                throw new Error('API Key টি সঠিক নয় বা মেয়াদ শেষ। নতুন Key তৈরি করুন: aistudio.google.com/app/apikey');
            }
            if (response.status === 429) {
                throw new Error(`API অনুরোধের সীমা শেষ হয়েছে। মডেল পরিবর্তন করে দেখতে পারেন বা কিছুক্ষণ পর চেষ্টা করুন। (${msg})`);
            }
            throw new Error(`Gemini API ব্যর্থ: ${msg}`);
        }

        const data = await response.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!rawText) {
            throw new Error('Gemini থেকে কোনো তথ্য পাওয়া যায়নি। ছবি আরো স্পষ্ট বা বড় করে চেষ্টা করুন।');
        }

        try {
            return JSON.parse(rawText.trim()) as ExtractedCVData;
        } catch (e: any) {
            console.error("Failed JSON:", rawText);
            throw new Error('Gemini এর থেকে আসা তথ্য সঠিকভাবে পড়া যাচ্ছে না। দয়া করে আবার চেষ্টা করুন।');
        }

    } catch (err: any) {
        clearTimeout(timeout);
        if (err.name === 'AbortError') {
            throw new Error(
                'বিশ্লেষণে বেশি সময় লাগছে (৩ মিনিট পার)। ' +
                'PDF এর পরিবর্তে ডকুমেন্টের স্পষ্ট ছবি (JPG/PNG) দিয়ে চেষ্টা করুন।'
            );
        }
        throw err;
    }
}
