import { kv } from '@vercel/kv';

import { NextResponse } from 'next/server';

type RouteParams = { params: {a: string, b: string} }

export async function PUT(req: Request, { params }: RouteParams) {
  const { a, b } = params
  console.log('putting data:', a, b);
  const data = await req.json();

  if (!(a && b && data)) {
    throw new Error('bad input');
  }
  if (a < b) {
    const response = await kv.set(`${a}\t${b}`.toLowerCase(), data);
    return NextResponse.json({ response });
  }
  const response = await kv.set(`${b}\t${a}`.toLowerCase(), data);
  return NextResponse.json({ response });
}

export async function GET(req: Request, { params }: RouteParams) {
  const { a, b } = params
  if (!(a && b)) {
    throw new Error('bad input');
  }
  if (a === b) {
    throw new Error('same-same');
  }
  let comparisons;
  try {
    if (a < b) {
      comparisons = await kv.get(`${a}\t${b}`.toLowerCase());

      console.log('cache retrieved:', comparisons);


    } else {
      comparisons = await kv.get(`${b}\t${a}`.toLowerCase());

    }
  } catch (err) {
  }
  if (!comparisons) {
    return NextResponse.json({ result: 'not cached' });
  }

  try {
    return NextResponse.json({
      result: 'cached',
      comparisons
    });
  } catch (err) {
    return NextResponse.json({
      result: 'error',
      error: err instanceof Error ? err.message : 'unknown error'
    })
  }
}
