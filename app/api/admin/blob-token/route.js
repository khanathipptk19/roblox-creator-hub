import { NextResponse } from 'next/server';
import { handleUpload } from '@vercel/blob/client';
import { requireAdmin } from '@/lib/auth';
import { MODEL_MAX, PREVIEW_MAX } from '@/lib/fileCheck';

export const runtime = 'nodejs';
const PATHNAME = /^(models\/[a-f0-9-]{36}\.rbxm|previews\/[a-f0-9-]{36}\.(png|jpg|webp))$/;

export async function POST(request) {
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'คำขอไม่ถูกต้อง' }, { status: 400 });
  try {
    const json = await handleUpload({
      body,
      request,
      // ตรวจสิทธิ์ที่นี่เท่านั้น (คำขอ webhook ขากลับจาก Vercel ไม่มีคุกกี้ของแอดมิน)
      onBeforeGenerateToken: async (pathname) => {
        if (!(await requireAdmin())) throw new Error('forbidden');
        if (!PATHNAME.test(pathname)) throw new Error('bad pathname');
        const model = pathname.startsWith('models/');
        return {
          allowedContentTypes: model ? ['application/octet-stream'] : ['image/png', 'image/jpeg', 'image/webp'],
          maximumSizeInBytes: model ? MODEL_MAX : PREVIEW_MAX,
          addRandomSuffix: false,
        };
      },
      onUploadCompleted: async () => {},
    });
    return NextResponse.json(json);
  } catch (e) {
    const forbidden = e?.message === 'forbidden';
    if (!forbidden) console.error('BLOB TOKEN ERROR:', e?.message);
    return NextResponse.json({ error: forbidden ? 'forbidden' : 'อัปโหลดไม่ได้' }, { status: forbidden ? 403 : 400 });
  }
}
