import { checkRateLimit, getClientId } from "@/lib/rate-limit";
import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Rate limit 확인 (선택적 - 실패해도 계속 진행)
    try {
      const clientId = getClientId(request);
      const rateLimit = await checkRateLimit(clientId, "upload");

      if (!rateLimit.allowed) {
        return NextResponse.json(
          {
            error: `업로드 요청이 너무 많습니다. ${rateLimit.blockedMinutes}분 후에 다시 시도해주세요.`,
          },
          { status: 429 }
        );
      }
    } catch (rateLimitError) {
      console.warn("Rate limit check failed, continuing without rate limiting:", rateLimitError);
      // Rate limit 실패해도 업로드는 계속 진행
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "파일이 없습니다." }, { status: 400 });
    }

    // 파일 크기 제한 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "파일 크기는 10MB 이하여야 합니다." },
        { status: 400 }
      );
    }

    // 이미지 파일만 허용
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "이미지 파일만 업로드 가능합니다." },
        { status: 400 }
      );
    }

    // Vercel Blob에 업로드
    // 환경 변수가 설정되어 있지 않으면 로컬 개발 모드로 폴백
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(file.name, file, {
        access: "public",
      });

      return NextResponse.json({ url: blob.url });
    } else {
      // 로컬 개발 환경: base64 데이터 URL로 변환
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // 개발 모드에서는 5MB까지 허용
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          {
            error:
              "개발 모드에서는 이미지 크기가 5MB 이하여야 합니다. Vercel에 배포하면 10MB까지 가능합니다.",
          },
          { status: 400 }
        );
      }

      const base64 = buffer.toString("base64");
      const dataUrl = `data:${file.type};base64,${base64}`;

      return NextResponse.json({
        url: dataUrl,
        warning:
          "개발 모드: 이미지가 base64로 저장됩니다 (localStorage 용량 제한 있음). Vercel에 배포하면 Blob Storage를 사용합니다.",
      });
    }
  } catch (error) {
    console.error("Upload error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;

    console.error("Upload error details:", {
      message: errorMessage,
      stack: errorStack,
      error,
    });

    return NextResponse.json(
      {
        error: "업로드 중 오류가 발생했습니다.",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
