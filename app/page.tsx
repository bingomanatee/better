'use client';
import YAML from 'yaml'
import { Fragment, useCallback, useMemo, memo, useState, useEffect, ChangeEventHandler, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation'

import {
  Box,
  Button,
  Heading, HStack,
  Text, VStack
} from '@chakra-ui/react'
import Comparison from '~/lib/Comparison'
import InputForm from '~/components/InputForm'
import { CompItem } from '../types'
import { sortBy } from 'lodash';

const decoder = new TextDecoder();

function diff(a: number, b: number) {
  if (!a || !b || (a === b)) {
    return 0;
  }
  let greater = Math.max(a, b);
  let lesser = Math.min(a, b);
  const ratio = greater / lesser;
  return Math.round(100 * (ratio - 1));
}

export default function Page() {
  const router = useRouter();
  const [hints, setHints] = useState<CompItem[]>([]);

  useEffect(() => {
    if (!router) {
      return;
    }
    if (hints.length) {
      return;
    }
    fetch('/api/stored')
      .then(async (response) => {
        const data = await response.json();
        setHints(data.comparisons.map((item: CompItem) => {
          return { ...item, go: () => router.push(`/${item.a}/${item.b}`) }
        }));
      }).catch((e) => console.error('error getting hints:', e));

  }, [router])

  const [a, setA] = useState('');
  const [b, setB] = useState('');

  const aOnChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setA(e.target?.value ?? '');
  }, [setA]);
  const bOnChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setB(e.target?.value ?? '');
  }, [setB]);

  return (
    <Box>
      <Box as="main" p={5}>
        <Heading>
          Ask OpenAI: Which is better
        </Heading>
        <Text size="lg" fontSize="lg" my={6}>
          Compare two things! enter two items to compare their worth -- such as "Apples" and "Oranges",
          "Tesla Roadster" and "Honda Fit"
        </Text>
        <InputForm a={a}
                   b={b}
                   aOnChange={aOnChange}
                   bOnChange={bOnChange}
                   action={['', encodeURIComponent(a), encodeURIComponent(b)].join('/')}
                   label={<span>  Compare &rarr;</span>}/>
      </Box>
      <VStack justify="center" spacing={1}>
        <Heading size="md">Suggestions</Heading>
        {Array.isArray(hints) ? sortBy(hints, ['a', 'b']).map((hint) => (
          <Button
            layerStyle="suggestion"
            onClick={hint.go}
            my={0} mx={3}
            colorScheme="gray" key={`${hint.a}-${hint.b}`}>
            <HStack>
              <Box layerStyle="suggestion-item">
                <Text textStyle="hint-a">{hint.a}</Text>
              </Box>
              <Box>
                <Text textStyle="hint-sep">v.</Text>
              </Box>
              <Box layerStyle="suggestion-item">
                <Text textStyle="hint-b">{hint.b}</Text>
              </Box>
            </HStack>
          </Button>)) : hints}
      </VStack>
    </Box>
  )
}
