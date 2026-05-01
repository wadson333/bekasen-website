import { NextRequest, NextResponse } from 'next/server';
import {
  ensureChatSession,
  getRequestChatSessionId,
  persistChatMessage,
  requestAllowsChatPersistence,
} from '@/lib/server/chat-history';

// Ollama API configuration
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'gemma4:e2b';

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
    
    // Check for greetings
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