import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { checkRateLimit, getClientId } from '@/lib/rate-limit';

export async function POST(request: Request): Promise<NextResponse> {
  // Development mode check
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      {
        error: '개발 모드: 대용량 파일 업로드는 Vercel 배포 환경에서 테스트하세요.',
        hint: 'vercel env pull 명령으로 환경 변수를 가져오거나, Vercel Preview에서 테스트하세요.',
      },
      { status: 503 }
    );
  }

  try {
    // Rate limiting check
    const clientId = getClientId(request);
    const rateLimit = await checkRateLimit(clientId, 'upload');

    if (!rateLimit.allowed) {
      const blockedMinutes = rateLimit.blockedMinutes || 5;
      return NextResponse.json(
        {
          error: '업로드 요청이 너무 많습니다.',
          message: `${blockedMinutes}분 후에 다시 시도해주세요.`,
          retryAfter: blockedMinutes,
        },
        { status: 429 }
      );
    }

    // Parse request body
    const body = (await request.json()) as HandleUploadBody;

    // Generate upload token
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        // Configure upload constraints
        return {
          allowedContentTypes: [
            'image/jpeg',
            'image/png',
            'image/webp',
            'image/gif',
          ],
          maxSize: 10 * 1024 * 1024, // 10MB limit
          addRandomSuffix: true, // Prevent filename conflicts
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // Log successful upload
        console.log('Large file uploaded successfully:', blob.url);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error('Token generation error:', error);

    return NextResponse.json(
      {
        error: '업로드 토큰 생성 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
