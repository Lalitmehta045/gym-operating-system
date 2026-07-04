import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const authHeader = request.headers.get('authorization');
  const cookieHeader = request.headers.get('cookie');
  
  try {
    const res = await fetch(`${apiUrl}/settings/integrations/whatsapp`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { Authorization: authHeader }),
        ...(cookieHeader && { cookie: cookieHeader }),
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });
    
    const text = await res.text();
    const data = text ? JSON.parse(text) : {};
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update whatsapp settings' },
      { status: 500 }
    );
  }
}
