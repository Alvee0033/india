import { NextResponse } from 'next/server';
import { getDashboardMetrics } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const stats = getDashboardMetrics();
    return NextResponse.json(stats);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
