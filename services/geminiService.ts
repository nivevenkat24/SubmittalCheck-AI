import { GoogleGenAI, Type, Chat } from "@google/genai";
import { SubmittalData, ReviewStatus } from "../types";

const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeSubmittalPDF = async (base64Data: string, mimeType: string, focusInstructions?: string): Promise<SubmittalData> => {
  // Upgraded to Gemini 3 Pro for superior reasoning on complex engineering specs
  const model = "gemini-3-pro-preview"; 
  
  const prompt = `
    You are a Senior AEC (Architecture, Engineering, Construction) Engineer performing a critical Submittal Review.
    
    Your task is to review the attached submittal document with extreme rigor. 
    
    *** INSTRUCTIONS FOR DUAL-PASS REVIEW ***
    1. FIRST PASS (Extraction): Read the ENTIRE document from start to finish. Do not skip any pages (e.g., read pages 14-18 carefully if they contain specs or data).
    2. SECOND PASS (Verification): "Double-Check" your findings against typical engineering specifications for this material. Act like a senior engineer checking the work of a junior. Look for subtle non-compliance issues, missing specific ASTM certifications, or outdated standards.

    ${focusInstructions ? `
    *** CRITICAL USER INSTRUCTION (HIGHEST PRIORITY) ***
    The user has requested a specific focus for this review: "${focusInstructions}".
    You MUST prioritize this aspect. If the submittal fails to meet requirements related to "${focusInstructions}", you must flag it as a major issue and likely recommend REVISE AND RESUBMIT.
    ` : ''}
    
    Extract and evaluate the following information:
    
    1. Submittal Number
    2. Contract Number (if available)
    3. Spec Section
    4. Description of Material/Product (Cite specific page numbers where description is found)
    5. Manufacturer and Model
    6. Required Attachments (data sheets, certifications, calculations)
    7. Completeness Check (Are files missing? Details missing?)
    8. Compliance Check (Conflicts with specs? List applicable clauses found in text. CITE PAGE NUMBERS for evidence.)
    9. Issues Identified (List specific technical or administrative issues. CITE PAGE NUMBERS for every issue identified e.g., "[Page 15] Voltage is 208V, spec requires 480V".)
    10. Recommended Review Status (Choose one: APPROVED / APPROVED AS NOTED / REVISE AND RESUBMIT / REJECT)
    11. Draft Engineer Response (Write a professional 2-4 sentence response to the contractor. Tone: Professional, Direct, Authoritative.)
    12. Suggested Next Steps for Contractor

    Return the response strictly as a JSON object matching the provided schema.
  `;

  try {
    const response = await genAI.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            submittalNumber: { type: Type.STRING, description: "The submittal ID or number" },
            contractNumber: { type: Type.STRING, description: "Contract number if found, else 'N/A'" },
            specSection: { type: Type.STRING, description: "Specification section number and title" },
            description: { type: Type.STRING, description: "Brief description of the material with page citation" },
            manufacturer: { type: Type.STRING, description: "Manufacturer name and model number" },
            requiredAttachments: { type: Type.STRING, description: "List of attachments mentioned or required" },
            completeness: {
              type: Type.OBJECT,
              properties: {
                isComplete: { type: Type.BOOLEAN },
                missingFiles: { type: Type.ARRAY, items: { type: Type.STRING } },
                missingDetails: { type: Type.ARRAY, items: { type: Type.STRING } }
              }
            },
            compliance: {
              type: Type.OBJECT,
              properties: {
                isCompliant: { type: Type.BOOLEAN },
                conflicts: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Any conflicts with typical specs, citing page numbers" },
                applicableClauses: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Spec clauses referenced or applicable" }
              }
            },
            issues: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of identified issues with Page Number citations" },
            recommendedStatus: { 
              type: Type.STRING, 
              enum: ["APPROVED", "APPROVED AS NOTED", "REVISE AND RESUBMIT", "REJECT"] 
            },
            draftResponse: { type: Type.STRING, description: "Professional engineer response text" },
            nextSteps: { type: Type.STRING, description: "Actionable steps for the contractor" }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    
    return JSON.parse(text) as SubmittalData;

  } catch (error) {
    console.error("Error analyzing submittal:", error);
    throw error;
  }
};

export const startChatSession = (base64Data: string, mimeType: string): Chat => {
  return genAI.chats.create({
    model: "gemini-3-pro-preview", // Upgraded to Gemini 3 Pro
    config: {
      tools: [{ googleSearch: {} }], // Enable Agentic capabilities via Google Search
    },
    history: [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data,
            },
          },
          { text: "You are an expert Senior AEC Engineer. You have access to the uploaded submittal document. Answer any questions I have about it professionally and accurately. Always 'double-check' your facts before answering. If I ask about specific pages (e.g., 'What is on page 15?'), verify the content on that specific page. Cite page numbers in your answers to prove you have read the document. If I ask about external facts (like if a product is discontinued, or current ASTM standards), use Google Search to verify the information." },
        ],
      },
      {
        role: "model",
        parts: [{ text: "I am ready. I have read the entire document. I will perform a rigorous double-check on all facts, cite specific page numbers in my answers, and verify external data with Google Search where necessary." }],
      },
    ],
  });
};