'use client'

import YAML from 'yaml'
import Comparison from '~/lib/Comparison'
import { sortBy, throttle } from 'lodash'


const decoder = new TextDecoder();


function parseYml(comparisons: Comparison[], yml: string, a: string, b: string, final?: boolean) {

  if (final) {
    // at this point all the data is read and we have no data;
    // this happens when ChatGPT returns bad data: usually this means
    // the data has "commentary" of ChatGPT surrounding the YML
    // saying why it can't parse your input...

    console.log('--- attempting to parse problematic content:', yml);
    let lines = yml.split(/[\n\r]/g);
    let start = lines.findIndex((string) => /^```/.test(string));
    if (start > -1) {
      const end = lines.slice(start + 1).findIndex((string) => /```$/.test(string)) + start;
      yml = lines.slice(start + 1, end + 1).join("\n");
    }
  }

  // this is the "DIGEST LOOP" in which data is streamed to the YML content
  try {
    let data;
    try {
      data = YAML.parse(yml);
    } catch (err) {
      // may be a "partial" chunk - delete last line
      let partYaml = yml.replace(/\n[^\n]+$/, '');
      data = YAML.parse(partYaml);
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
    console.error('error parsing yml:', err, yml);
    // this will happen if the chat GPT is returning a result in which the YML is badly formed because it was
    // putting content line by line.
  }


  return comparisons;
}

export async function* fetchGPTresponses(a: string, b: string) {
  console.log("START FGR: ", a, b);
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
    console.log("FGR Reaading.....");
    const { done, value } = await reader.read();
    if (done) {
      console.log('FGR: end of stream', value);
      stop = true
      break;
    } else {
      yml = `${yml}${decoder.decode(value)}`;
      comparisons = parseYml(comparisons, yml, a, b);
      console.log("FGR: yielding", comparisons);
      yield comparisons
    }

  } while (!stop);

  if (!comparisons.length) {
    yield parseYml(comparisons, yml, a, b, true);
  }

  console.log("FGR: done");
  return comparisons;
}
