import { NextResponse } from 'next/server';

// Simple test endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Chat test endpoint',
    timestamp: new Date().toISOString(),
    endpoints: {
      main: '/api/chat',
      test: '/api/chat/test',
      health: '/api/chat/health'
    }
  });
}

export async function POST(request: Request) {
  try {
    const { message } = await request.json();
    
    return NextResponse.json({
      status: 'received',
      message: message || 'No message provided',
      response: `Test response to: "${message || 'empty message'}"`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: 'Invalid JSON',
      timestamp: new Date().toISOString()
    }, { status: 400 });
  }
}