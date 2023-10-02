import { kv } from '@vercel/kv';

import { NextResponse } from 'next/server';
import abRedisKey from '~/lib/abRedisKey'

type RouteParams = { params: { a: string, b: string } }

export async function PUT(req: Request, { params }: RouteParams) {
  const { a, b } = params
  const key = abRedisKey(a, b);
  console.log('putting data:', a, b, 'into', key);
  const data = await req.json();

  if (!(a && b && data)) {
    throw new Error('bad input');
  }
  const response = await kv.set(key, data);
  return NextResponse.json({ response });
}

export async function GET(req: Request, { params }: RouteParams) {

  try {
    const { a, b } = params;
    const key = abRedisKey(a, b);
    if (!(a && b)) {
      throw new Error('bad input');
    }
    if (a === b) {
      throw new Error('same-same');
    }
    let comparisons = await kv.get(key);
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


export async function DELETE(req: Request, { params }: RouteParams) {
  const { a, b } = params
  const key = abRedisKey(a,b);
  try {
    const response = await kv.del(`${a}\t${b}`.toLowerCase());
    return NextResponse.json({
      result: 'deleted',
      response
    })
  } catch (err) {
    console.log('error deleting', a, b, err);
    return NextResponse.json({
      result: 'error',
      error: err instanceof Error ? err.message : 'unknown error'
    })
  }

}
