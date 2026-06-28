import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const gymId = searchParams.get('gymId');
  const query = searchParams.get('query');

  if (!gymId || !query) {
    return NextResponse.json({ error: 'Missing gymId or query' }, { status: 400 });
  }

  const backendUrl = process.env.NEXT_PUBLIC_API_URL;
  const targetUrl = `${backendUrl}/attendances/kiosk-search?gymId=${gymId}&query=${query}`;

  try {
    const res = await fetch(targetUrl);
    
    // Check if the response is valid json before trying to parse
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await res.json();
      return NextResponse.json(data, { status: res.status });
    }
    
    return new NextResponse(res.body, { status: res.status, headers: res.headers });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
