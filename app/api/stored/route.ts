import { kv } from '@vercel/kv';

import { NextResponse } from 'next/server';
import { CompItem } from '../../../types'

type RouteParams = { params: { a: string, b: string } }

const RE = /(.+)\t(.+)/

export async function GET(_req: Request) {
  console.log('getting saved keys -------');
  try {
    let [_id, comparisons] = await kv.scan(0, { match: '*\t*' });
    if (Array.isArray(comparisons)) {
      // @ts-ignore
      comparisons = comparisons.reduce((c: CompItem[], item: any) => {
        if (!
          (item && (typeof item === 'string') && RE.test(item))
        ) {
          console.log('bad item', item, typeof item, RE.test(item));
          return c;
        }
        const [a, b] = item.split(/\t/g);
//        kv.del(item); // deleting all keys - debug @TODO REMOVE THIS LINE !!!!!
        c.push({ a, b });

        return c;
      }, [])
    }
    console.log('------- saved keys are ', comparisons);
    return NextResponse.json({
      comparisons
    });

  } catch (err) {
    return NextResponse.json({
      result: 'error',
      error: err instanceof Error ? err.message : 'unknown error'
    })
  }
}
