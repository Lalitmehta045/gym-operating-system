import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/lib/backend-fetch';

export async function GET(req: NextRequest) {
  try {
    const data = await backendFetch(req, '/staff');
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('STAFF_API_ERROR:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to fetch staff' },
      { status: error.status || 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = await backendFetch(req, '/staff', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Failed to create staff' },
      { status: error.status || 500 }
    );
  }
}
