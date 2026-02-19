import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({ error: 'This API endpoint is no longer in use.' }, { status: 410 });
}
