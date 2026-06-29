import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  // Get auth token from incoming request headers or cookies
  const authHeader = request.headers.get('authorization');
  const cookieHeader = request.headers.get('cookie');
  
  const url = `${apiUrl}/subscriptions?${searchParams.toString()}`;
  
  try {
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        // Forward auth token if present
        ...(authHeader && { Authorization: authHeader }),
        ...(cookieHeader && { cookie: cookieHeader }),
      },
      cache: 'no-store',
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions' },
      { status: 500 }
    );
  }
}
