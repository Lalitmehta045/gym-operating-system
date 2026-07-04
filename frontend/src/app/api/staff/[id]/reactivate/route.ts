import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/lib/backend-fetch';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await backendFetch(req, `/staff/${id}/reactivate`, {
      method: 'PATCH',
    });
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Failed to reactivate staff' },
      { status: error.status || 500 }
    );
  }
}
