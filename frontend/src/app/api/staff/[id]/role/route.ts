import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/lib/backend-fetch';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const data = await backendFetch(req, `/staff/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Failed to update role' },
      { status: error.status || 500 }
    );
  }
}
