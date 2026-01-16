import { kv } from '@vercel/kv';

interface RateLimitData {
  count: number;
  blockedUntil: number;
}

interface RateLimitResult {
  allowed: boolean;
  remainingAttempts?: number;
  blockedMinutes?: number;
  currentCount?: number;
}

const MAX_ATTEMPTS = 5;
const BLOCK_DURATION_MS = 15 * 60 * 1000; // 15분
const ATTEMPT_TTL_SECONDS = 60 * 60; // 1시간 후 자동 만료

// API별 레이트 리미팅 설정
const RATE_LIMIT_CONFIGS = {
  login: { maxAttempts: 5, blockMinutes: 15, windowSeconds: 60 * 60 },
  upload: { maxAttempts: 20, blockMinutes: 5, windowSeconds: 60 * 30 }, // 30분에 20개 업로드 (제품 사진 고려)
  'change-password': { maxAttempts: 3, blockMinutes: 30, windowSeconds: 60 * 60 }, // 1시간에 3번
  'create-content': { maxAttempts: 20, blockMinutes: 10, windowSeconds: 60 * 30 }, // 30분에 20개 생성
} as const;

// KV 사용 가능 여부 확인
function isKVAvailable(): boolean {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

// In-memory fallback (개발 환경용)
const memoryStore = new Map<string, RateLimitData>();

async function getAttemptData(key: string): Promise<RateLimitData | null> {
  if (isKVAvailable()) {
    try {
      return await kv.get<RateLimitData>(key);
    } catch (error) {
      console.error('KV get error:', error);
      return memoryStore.get(key) || null;
    }
  }
  return memoryStore.get(key) || null;
}

async function setAttemptData(key: string, data: RateLimitData, apiType: keyof typeof RATE_LIMIT_CONFIGS = 'login'): Promise<void> {
  const config = RATE_LIMIT_CONFIGS[apiType];
  if (isKVAvailable()) {
    try {
      await kv.set(key, data, { ex: config.windowSeconds });
    } catch (error) {
      console.error('KV set error:', error);
      memoryStore.set(key, data);
    }
  } else {
    memoryStore.set(key, data);
  }
}

async function deleteAttemptData(key: string): Promise<void> {
  if (isKVAvailable()) {
    try {
      await kv.del(key);
    } catch (error) {
      console.error('KV delete error:', error);
      memoryStore.delete(key);
    }
  } else {
    memoryStore.delete(key);
  }
}

export async function checkRateLimit(clientId: string, apiType: keyof typeof RATE_LIMIT_CONFIGS = 'login'): Promise<RateLimitResult> {
  const config = RATE_LIMIT_CONFIGS[apiType];
  const key = `rate-limit:${apiType}:${clientId}`;
  const now = Date.now();
  const data = await getAttemptData(key);

  if (data) {
    // 차단 시간 확인
    if (data.blockedUntil > now) {
      const remainingMs = data.blockedUntil - now;
      return {
        allowed: false,
        blockedMinutes: Math.ceil(remainingMs / 60000),
      };
    }

    // 차단 시간이 지났으면 리셋
    if (data.blockedUntil > 0 && data.blockedUntil <= now) {
      await deleteAttemptData(key);
      return { allowed: true, remainingAttempts: config.maxAttempts };
    }

    // 최대 시도 횟수 초과 확인
    if (data.count >= config.maxAttempts) {
      const blockTime = now + config.blockMinutes * 60 * 1000;
      await setAttemptData(key, { count: data.count, blockedUntil: blockTime }, apiType);
      return {
        allowed: false,
        blockedMinutes: config.blockMinutes,
      };
    }

    return { allowed: true, remainingAttempts: config.maxAttempts - data.count };
  }

  return { allowed: true, remainingAttempts: config.maxAttempts };
}

export async function recordFailedAttempt(clientId: string, apiType: keyof typeof RATE_LIMIT_CONFIGS = 'login'): Promise<number> {
  const config = RATE_LIMIT_CONFIGS[apiType];
  const key = `rate-limit:${apiType}:${clientId}`;
  const data = await getAttemptData(key);

  const newCount = (data?.count || 0) + 1;
  await setAttemptData(key, {
    count: newCount,
    blockedUntil: data?.blockedUntil || 0,
  }, apiType);

  return newCount;
}

export async function clearAttempts(clientId: string, apiType: keyof typeof RATE_LIMIT_CONFIGS = 'login'): Promise<void> {
  const key = `rate-limit:${apiType}:${clientId}`;
  await deleteAttemptData(key);
}

export function getClientId(request: Request): string {
  const headers = request.headers;

  // Vercel이 제공하는 신뢰할 수 있는 IP 헤더 사용
  const ip = headers.get('x-vercel-forwarded-for') ||
             headers.get('x-forwarded-for')?.split(',')[0].trim() ||
             headers.get('x-real-ip') ||
             'unknown';

  // User-Agent 해시를 추가하여 동일 IP에서 다른 사용자 구분
  const userAgent = headers.get('user-agent') || '';
  const userAgentHash = createHash(userAgent);

  return `${ip}:${userAgentHash}`;
}

// User-Agent 문자열의 짧은 해시 생성
function createHash(str: string): string {
  if (!str) return 'none';

  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36).substring(0, 8);
}
