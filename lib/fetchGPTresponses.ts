'use client'

import YAML from 'yaml'
import Comparison from '~/lib/Comparison'
import { sortBy, isEqual } from 'lodash'


const decoder = new TextDecoder();

function parseYml(comparisons: Comparison[], yml: string, a: string, b: string, final?: boolean) {
  // this is the "DIGEST LOOP" in which data is streamed to the YML content
  try {
    let data;
    try {
      data = YAML.parse(yml);
    } catch (err) {
      if (final) {
        // at this point all the data is read and we cannot read the data;
        // this happens when ChatGPT returns bad data: usually this means
        // the data has "commentary" of ChatGPT surrounding the YML
        // saying why it can't parse your input...

        let lines = yml.split(/[\n\r]/g);
        let start = lines.findIndex((string) => /^```/.test(string));
        if (start > -1) {
          const end = lines.slice(start + 1).findIndex((string) => /```$/.test(string)) + start;
          yml = lines.slice(start + 1, end + 1).join("\n");
        }
      } else {
        // may be a "partial" chunk - delete last line
        yml = yml.replace(/\n[^\n]+$/, '');
      }
      data = YAML.parse(yml);
    }
    if (Array.isArray(data)) {
      const newComparisons = data.map(item => new Comparison(item, a, b));
      const m = new Map();
      comparisons.forEach((c) => m.set(c.feature, c));
      comparisons.forEach((c) => c.old = true); // because "Partial features" cause fragements in dom, make them not show up
      newComparisons.forEach((c) => m.set(c.feature, c));
      const merged = Array.from(m.values());
      return sortBy(merged, 'feature');
    }
  } catch (err) {
    // console.error('error parsing yml:', err, yml);
    // this will happen if the chat GPT is returning a result in which the YML is badly formed because it was
    // putting content line by line.
    // return the comparisons from the last pass
  }


  return sortBy(comparisons, 'feature');
}

export async function* fetchGPTresponses(a: string, b: string) {
  let body;
  const response = await fetch('/api/chat', { method: 'post', body: JSON.stringify({ a, b }) });
  body = response.body;

  const reader = body?.getReader();
  if (!reader) {
    throw new Error('cannot read chat');
  }
  let yml = '';

  let comparisons: Comparison[] = [];

  let stop = false
  do {
    const { done, value } = await reader.read();
    if (done) {
      stop = true
      break;
    } else {
      yml = `${yml}${decoder.decode(value)}`;
      let next = parseYml(comparisons, yml, a, b);
      if (!isEqual(next, comparisons)) {
        comparisons = next;
        yield comparisons
      }
    }

  } while (!stop);

  if (!comparisons.length) {
    yield parseYml(comparisons, yml, a, b, true);
  }

  return comparisons;
}
