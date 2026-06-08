import { NextResponse } from 'next/server';
import { aiStatus } from '@/lib/ai-status';

export async function GET() {
  // Return the current status
  return NextResponse.json({
    isGeminiFailed: aiStatus.isGeminiFailed
  });
}
