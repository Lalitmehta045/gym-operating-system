import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/lib/backend-fetch';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await backendFetch(req, `/staff/${params.id}/deactivate`, {
      method: 'PATCH',
    });
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Failed to deactivate staff' },
      { status: error.status || 500 }
    );
  }
}
