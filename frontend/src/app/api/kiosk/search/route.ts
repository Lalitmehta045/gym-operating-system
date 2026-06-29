import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  try {
    const res = await fetch(
      `${apiUrl}/attendances/kiosk-search?${searchParams.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        cache: 'no-store',
      }
    );

    const data = await res.json();
    
    return NextResponse.json(data, { 
      status: res.status,
      headers: {
        'Cache-Control': 'no-store, no-cache',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Accept',
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to search members' },
      { status: 500 }
    );
  }
}

// Handle iOS Safari preflight OPTIONS request  
export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Accept',
    }
  });
}
