import { NextResponse } from 'next/server';
import { initializeDatabase, testConnection, getTableStats } from '@/lib/db';

// 데이터베이스 초기화 (테이블 생성)
// 배포 후 한 번만 호출하면 됨
export async function POST() {
  try {
    // 연결 테스트
    const connectionTest = await testConnection();
    if (!connectionTest.success) {
      return NextResponse.json(
        { error: 'Database connection failed', message: connectionTest.error },
        { status: 500 }
      );
    }

    // 데이터베이스 초기화
    await initializeDatabase();

    // 테이블 통계 조회
    const stats = await getTableStats();

    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully',
      stats,
    });
  } catch (error) {
    console.error('Database initialization error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize database', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// 데이터베이스 상태 확인 (테이블이 없으면 자동 초기화)
export async function GET() {
  try {
    // 연결 테스트
    const connectionTest = await testConnection();
    if (!connectionTest.success) {
      return NextResponse.json(
        { connected: false, error: connectionTest.error },
        { status: 500 }
      );
    }

    // 테이블 통계 조회 시도
    try {
      const stats = await getTableStats();
      return NextResponse.json({
        connected: true,
        initialized: true,
        stats,
      });
    } catch (statsError) {
      // 테이블이 없는 경우 자동으로 초기화
      console.log('Tables not found, initializing database...');
      await initializeDatabase();

      // 초기화 후 통계 다시 조회
      const stats = await getTableStats();

      return NextResponse.json({
        connected: true,
        initialized: true,
        autoInitialized: true,
        message: 'Database was automatically initialized',
        stats,
      });
    }
  } catch (error) {
    console.error('Database status check error:', error);
    return NextResponse.json(
      { connected: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
