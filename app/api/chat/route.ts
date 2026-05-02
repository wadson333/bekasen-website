import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import {
  ensureChatSession,
  getRequestChatSessionId,
  loadChatMessages,
  persistChatMessage,
  requestAllowsChatPersistence,
} from '@/lib/server/chat-history';
import { db } from '@/lib/db';
import { contactSubmissions } from '@/drizzle/schema';
import { openRouterChat, type OpenRouterMessage } from '@/lib/openrouter';
import { notifyNewLead } from '@/lib/email';
import { sanitizePlainText } from '@/lib/sanitize';

// Ollama API configuration (legacy local fallback, only when reachable)
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'gemma4:e2b';

// Lead qualification: cap conversation length per spec section 9.3
const MAX_CHATBOT_TURNS = 10;
const QUALIFIED_MARKER_RE =
  /<<QUALIFIED:name=([^|>]+)\|email=([^|>]+)\|project=([^|>]+)>>/i;

// Enhanced FAQ database with better intent matching
const FAQ_DATABASE = [
  {
    keywords: ['service', 'services', 'what do you offer', 'offerings', 'work', 'digital transformation'],
    question: 'What services does Bekasen offer?',
    answer: 'We design and build high-performance websites, custom business applications, and AI-powered solutions — tailored for ambitious companies. We specialize in Next.js, Tailwind CSS, JHipster for backend, Flutter for mobile, and AI integration.',
    category: 'services'
  },
  {
    keywords: ['price', 'pricing', 'cost', 'how much', 'budget', 'rate', 'quote'],
    question: 'How much do your services cost?',
    answer: 'Our projects start from a discovery call. Pricing depends on scope, complexity and timeline. Visit our pricing page or start a project to get a custom quote. We offer transparent pricing with no hidden fees.',
    category: 'pricing'
  },
  {
    keywords: ['timeline', 'time', 'duration', 'how long', 'delivery', 'schedule'],
    question: 'What is your typical project timeline?',
    answer: 'Timelines vary based on project complexity: Showcase websites (2-4 weeks), Custom applications (4-12 weeks), AI integrations (1-3 weeks). We provide detailed timelines during the discovery phase.',
    category: 'timeline'
  },
  {
    keywords: ['tech', 'technology', 'stack', 'what tech', 'tools', 'framework', 'nextjs', 'flutter'],
    question: 'What technologies do you use?',
    answer: 'Our tech stack includes: Frontend - Next.js 16, React 19, Tailwind CSS; Backend - JHipster (Spring Boot), Python FastAPI; Mobile - Flutter/Dart; AI - OpenRouter, Ollama, custom RAG systems.',
    category: 'tech'
  },
  {
    keywords: ['contact', 'get in touch', 'email', 'phone', 'reach', 'call', 'hello'],
    question: 'How can I contact Bekasen?',
    answer: 'You can contact us via: Email - contact@bekasen.com, WhatsApp - +509 3730 5068, the contact form, or book a free 15-min call at https://cal.com/bekasen-ytjx1n/15min.',
    category: 'contact'
  },
  {
    keywords: ['portfolio', 'projects', 'work', 'examples', 'showcase', 'past work'],
    question: 'Can I see your previous work?',
    answer: 'Yes! Visit our Portfolio page to see case studies and live projects. We\'ve worked with hotels, churches, clinics, and retail businesses in Haiti and the diaspora.',
    category: 'portfolio'
  },
  {
    keywords: ['process', 'workflow', 'how you work', 'methodology', 'development process'],
    question: 'What is your development process?',
    answer: 'Our process: 1) Discovery & Strategy, 2) Design & Prototyping, 3) Development & Testing, 4) Launch & Training, 5) Maintenance & Support. We use agile methodologies with regular client updates.',
    category: 'process'
  },
  {
    keywords: ['haiti', 'haitian', 'local', 'caribbean', 'diaspora', 'international'],
    question: 'Do you work with clients outside Haiti?',
    answer: 'Yes! While we\'re based in Haiti, we serve clients worldwide, especially the Haitian diaspora in US, Canada, and Europe. We also work with businesses across the Caribbean and African regions.',
    category: 'location'
  },
  {
    keywords: ['hotel', 'guesthouse', 'accommodation', 'hospitality'],
    question: 'Do you work with hotels?',
    answer: 'Yes! We specialize in digital solutions for hotels and guesthouses: booking systems, management dashboards, guest experience apps, and marketing websites.',
    category: 'niche-hotel'
  },
  {
    keywords: ['church', 'religious', 'ministry', 'faith'],
    question: 'Do you work with churches?',
    answer: 'Absolutely! We help churches with membership portals, donation systems, event management, live streaming solutions, and community engagement platforms.',
    category: 'niche-church'
  },
  {
    keywords: ['clinic', 'medical', 'healthcare', 'hospital'],
    question: 'Do you work with clinics?',
    answer: 'Yes! We build healthcare solutions: patient management systems, appointment booking, telehealth platforms, and medical record management.',
    category: 'niche-clinic'
  },
  {
    keywords: ['pèpè', 'boutique', 'retail', 'shop', 'ecommerce'],
    question: 'Do you work with retail businesses?',
    answer: 'Yes! We help retail businesses with e-commerce platforms, inventory management, point-of-sale systems, and customer loyalty programs.',
    category: 'niche-retail'
  }
];

// Function to find the best FAQ match
function findBestFAQMatch(userMessage: string) {
  const message = userMessage.toLowerCase().trim();
  
  // Simple keyword matching with scoring
  let bestMatch = null;
  let bestScore = 0;
  
  for (const faq of FAQ_DATABASE) {
    let score = 0;
    
    // Check for exact question match
    if (message.includes(faq.question.toLowerCase())) {
      score += 10;
    }
    
    // Check for keyword matches
    for (const keyword of faq.keywords) {
      if (message.includes(keyword)) {
        score += 3;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = faq;
    }
  }
  
  // Only return if score is above threshold
  return bestScore >= 3 ? bestMatch : null;
}

// Simple greeting detection
function isGreeting(message: string): boolean {
  const greetings = [
    'hello', 'hi', 'hey', 'bonjour', 'salut', 'hola', 'salutations',
    'good morning', 'good afternoon', 'good evening', 'howdy',
    'what\'s up', 'yo', 'greetings', 'bonjou', 'sak pase', 'ça va'
  ];
  
  const msg = message.toLowerCase().trim();
  return greetings.some(greeting => msg.includes(greeting)) || msg.length < 10;
}

// Fallback responses for unmatched queries
const FALLBACK_RESPONSES = [
  "I understand you're asking about something specific. Could you rephrase your question or use one of the quick questions below?",
  "That's an interesting question! For detailed inquiries, I recommend contacting our team directly via the contact form.",
  "I'm still learning! For complex questions, please check our FAQ section or contact us for personalized assistance.",
  "Thanks for your question! Our team specializes in this area. Would you like me to connect you with an expert?",
  "I've noted your question. In the meantime, you might find answers in our Services or Portfolio pages."
];

// Ollama query function with custom prompt
async function queryOllama(userMessage: string, locale: string): Promise<string> {
  const systemPrompt = `You are the official AI assistant for Bekasen Digital Innovators, a premium digital agency based in Haiti serving Haitian businesses and the diaspora.

CRITICAL CONTEXT:
- Bekasen specializes in: Hotels/Guesthouses, Churches, Clinics, Pèpè Boutiques
- Tech Stack: Next.js, Tailwind CSS, JHipster (Spring Boot), Python FastAPI, Flutter/Dart
- Brand: Dark premium aesthetic (violet/indigo), Syne + Inter fonts
- Services: Websites, Custom Applications, AI Chatbot Integration, E-commerce
- Company: Bekasen Digital Innovators (bekasen.com), also co-funder of Ciatech

RULES:
1. ALWAYS respond in a professional, helpful tone matching the user's language (${locale})
2. Focus on digital transformation for niche markets
3. Mention relevant tech stack when discussing solutions
4. Be concise and action-oriented
5. If unsure, suggest contacting the team via contact@bekasen.com
6. Never make up pricing - direct to pricing page or offer a discovery call
7. Highlight our expertise in Haitian market with international standards
8. Keep responses under 3-4 sentences

User question: ${userMessage}`;

  const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt: systemPrompt,
      stream: false,
      options: {
        temperature: 0.3,
        top_p: 0.9,
        max_tokens: 500
      }
    }),
    signal: AbortSignal.timeout(15000) // 15 second timeout
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Ollama API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.response || 'I apologize, but I couldn\'t generate a response. Please try again or contact us directly.';
}

// ─── OpenRouter lead-qualification path (primary, per spec section 9) ──────
// Returns null if disabled / fails — caller falls back to rule-based.

const SYSTEM_PROMPT = `You are Bekasen's scheduling assistant. Bekasen is a solo digital agency serving Haitian businesses and the diaspora (websites, business apps, AI integrations).

Your ONLY job is to understand what the visitor needs and collect three things:
  1. Their name
  2. Their email
  3. Their project type (e.g. website, e-commerce, booking system, mobile app, AI assistant)

CRITICAL RULES:
- Do NOT answer technical questions in detail. Defer to the founder.
- Do NOT quote prices. Always say a discovery call is needed.
- Keep every response under 3 sentences.
- Reply in the user's language (fr/en/ht/es) — match what they wrote.
- Ask ONE question at a time. Maximum 3 short questions before sharing the call link.

When you have collected ALL THREE pieces of information, your VERY NEXT message must:
  1. Start with the single line: <<QUALIFIED:name=THE_NAME|email=THE_EMAIL|project=THE_PROJECT_TYPE>>
  2. Then a friendly thank-you sentence.
  3. Then the booking link: https://cal.com/bekasen-ytjx1n/15min

If the visitor refuses to share info, politely point them to https://cal.com/bekasen-ytjx1n/15min and stop. Never invent values for the QUALIFIED marker.`;

type QualifiedExtract = { name: string; email: string; projectType: string } | null;

function parseQualifiedMarker(text: string): {
  cleaned: string;
  qualified: QualifiedExtract;
} {
  const match = text.match(QUALIFIED_MARKER_RE);
  if (!match) return { cleaned: text, qualified: null };
  const cleaned = text.replace(QUALIFIED_MARKER_RE, "").replace(/^\s*\n+/, "").trim();
  return {
    cleaned,
    qualified: {
      name: match[1].trim().slice(0, 255),
      email: match[2].trim().slice(0, 255),
      projectType: match[3].trim().slice(0, 100),
    },
  };
}

/**
 * Tries OpenRouter; returns null when the key is missing or the call fails.
 * On qualification, inserts a contact_submissions row + emails the founder.
 */
async function tryOpenRouterPath(opts: {
  message: string;
  locale: string;
  sessionId: string | null;
  canPersist: boolean;
}): Promise<{ response: string; qualified: boolean; turnCount: number } | null> {
  // Load history if we have a persisted session
  let history: Array<{ role: string; content: string }> = [];
  if (opts.sessionId) {
    try {
      history = await loadChatMessages(opts.sessionId);
    } catch {
      history = [];
    }
  }

  // Cap conversation length (spec 9.3) — after MAX_CHATBOT_TURNS, surface CTA
  const userTurns = history.filter((m) => m.role === "user").length + 1;
  if (userTurns > MAX_CHATBOT_TURNS) {
    return {
      response:
        "I want to give you the best answer — let's hop on a quick call instead: https://cal.com/bekasen-ytjx1n/15min",
      qualified: false,
      turnCount: userTurns,
    };
  }

  const messages: OpenRouterMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history.slice(-10).map((m) => ({
      role: (m.role === "user" ? "user" : "assistant") as "user" | "assistant",
      content: String(m.content).slice(0, 4000),
    })),
    { role: "user", content: opts.message },
  ];

  const result = await openRouterChat({ messages });
  if (!result.ok) {
    console.warn("[chat] OpenRouter unavailable:", result.reason, result.detail ?? "");
    return null;
  }

  const { cleaned, qualified } = parseQualifiedMarker(result.text);

  // On qualification, persist the lead + notify founder (best-effort)
  if (qualified) {
    try {
      const [row] = await db
        .insert(contactSubmissions)
        .values({
          name: sanitizePlainText(qualified.name, 255),
          email: qualified.email.toLowerCase().trim(),
          projectType: sanitizePlainText(qualified.projectType, 100),
          message: `Lead qualified by chatbot.\nLast user message: ${opts.message.slice(0, 800)}`,
          source: "chatbot",
          isQualified: true,
        })
        .returning({ id: contactSubmissions.id });
      console.log("[chat] qualified lead persisted:", row?.id);

      void notifyNewLead({
        name: qualified.name,
        email: qualified.email,
        projectType: qualified.projectType,
        message: opts.message,
        source: "chatbot",
        isQualified: true,
      });
    } catch (err) {
      console.error("[chat] failed to persist qualified lead:", err);
    }
  }

  return { response: cleaned, qualified: !!qualified, turnCount: userTurns };
}

// Check Ollama connection
async function checkOllamaConnection(): Promise<boolean> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      signal: AbortSignal.timeout(5000)
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { message, locale = 'en' } = await request.json();
    const sessionId = getRequestChatSessionId(request);
    const canPersistChat = sessionId ? requestAllowsChatPersistence(request) : false;
    
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      );
    }

    const persistExchange = async (assistantMessage: string, source: string, model: string | null = null) => {
      if (!canPersistChat || !sessionId) {
        return;
      }

      await ensureChatSession(sessionId, locale);
      await persistChatMessage({ sessionId, role: 'user', content: message, source: 'user' });
      await persistChatMessage({ sessionId, role: 'assistant', content: assistantMessage, source, model });
    };
    
    // ── PRIMARY PATH: OpenRouter lead qualification ─────────────────────────
    // When OPENROUTER_API_KEY is configured, the AI drives the entire flow
    // (including greeting, qualification questions, and Cal.com hand-off).
    // The legacy greeting/FAQ/Ollama paths below act as graceful fallbacks
    // when the key is missing or the API call fails.
    const openRouterEnabled =
      !!process.env.OPENROUTER_API_KEY?.trim() &&
      process.env.OPENROUTER_API_KEY?.trim() !== "PLACEHOLDER";

    if (openRouterEnabled) {
      const ai = await tryOpenRouterPath({
        message,
        locale,
        sessionId: sessionId ?? null,
        canPersist: canPersistChat,
      });
      if (ai) {
        await persistExchange(
          ai.response,
          ai.qualified ? "openrouter-qualified" : "openrouter",
          process.env.OPENROUTER_MODEL ?? null,
        );
        return NextResponse.json({
          response: ai.response,
          source: ai.qualified ? "openrouter-qualified" : "openrouter",
          model: process.env.OPENROUTER_MODEL ?? "openrouter",
          qualified: ai.qualified,
          turnCount: ai.turnCount,
        });
      }
      // OpenRouter call failed — drop through to rule-based fallbacks
    }

    // Check for greetings (rule-based fallback)
    if (isGreeting(message)) {
      const greetingResponse = locale === 'ht'
        ? "Bonjou! 👋 Mwen se asistans Bekasen a. Kouman mwen ka ede w jodi a? Mwen ka reponn kesyon sou sèvis, pri, delè, teknoloji, ak plis ankò."
        : locale === 'fr'
        ? "Bonjour! 👋 Je suis l'assistant Bekasen. Comment puis-je vous aider aujourd'hui ? Je peux répondre à des questions sur nos services, tarifs, délais, technologie, et plus."
        : locale === 'es'
        ? "¡Hola! 👋 Soy el asistente de Bekasen. ¿Cómo puedo ayudarte hoy? Puedo responder preguntas sobre servicios, precios, plazos, tecnología y más."
        : "Hello! 👋 I'm the Bekasen assistant. How can I help you today? I can answer questions about our services, pricing, timeline, technology, and more.";

      await persistExchange(greetingResponse, 'greeting');

      return NextResponse.json({
        response: greetingResponse,
        source: 'greeting',
        suggestedQuestions: ['services', 'pricing', 'timeline', 'tech', 'contact']
      });
    }

    // Check FAQ database
    const faqMatch = findBestFAQMatch(message);
    if (faqMatch) {
      await persistExchange(faqMatch.answer, 'faq');

      return NextResponse.json({
        response: faqMatch.answer,
        question: faqMatch.question,
        source: 'faq',
        category: faqMatch.category,
        confidence: 'high'
      });
    }
    
    // Try Ollama as fallback
    const ollamaAvailable = await checkOllamaConnection();
    if (ollamaAvailable) {
      try {
        const ollamaResponse = await queryOllama(message, locale);
        await persistExchange(ollamaResponse, 'ollama', OLLAMA_MODEL);

        return NextResponse.json({
          response: ollamaResponse,
          source: 'ollama',
          model: OLLAMA_MODEL,
          confidence: 'ai-generated'
        });
      } catch (ollamaError) {
        console.error('Ollama fallback failed:', ollamaError);
        // Continue to final fallback
      }
    }
    
    // Final fallback response
    const randomFallback = FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
    await persistExchange(randomFallback, 'fallback');

    return NextResponse.json({
      response: randomFallback,
      source: 'fallback',
      suggestions: [
        'What services do you offer?',
        'How much does a website cost?',
        'What is your typical timeline?',
        'What technologies do you use?'
      ]
    });
    
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        response: 'Sorry, I encountered an error. Please try again or contact us directly at contact@bekasen.com.' 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  const ollamaAvailable = await checkOllamaConnection();
  
  return NextResponse.json({
    status: 'active',
    faqCount: FAQ_DATABASE.length,
    supportedFeatures: [
      'faq-matching', 
      'greeting-detection', 
      'multi-language',
      ollamaAvailable ? 'ollama-available' : 'ollama-unavailable'
    ],
    ollama: {
      available: ollamaAvailable,
      model: ollamaAvailable ? OLLAMA_MODEL : null,
      url: OLLAMA_BASE_URL
    },
    message: 'Bekasen Chat API is running. Send a POST request with { "message": "your question" }'
  });
}