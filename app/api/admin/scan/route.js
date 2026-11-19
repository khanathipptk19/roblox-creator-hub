import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { scanSource } from '@/lib/scan';

export async function POST(req) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const { source } = await req.json();
  return NextResponse.json({ findings: scanSource(source || '') });
}
