'use client';
import YAML from 'yaml'
import { Fragment, useCallback, useMemo, memo, useState, useEffect } from 'react';

import {
  Box,
  Button,
  Heading,
  HStack,
  Input,
  InputGroup,
  InputLeftAddon,
  Text
} from '@chakra-ui/react'
import Comparison from '~/lib/Comparison'

const decoder = new TextDecoder();

function diff(a: number, b: number) {
  if (!a || !b || (a === b)) return 0;
  let greater = Math.max(a, b);
  let lesser = Math.min(a, b);
  const ratio = greater / lesser;
  return Math.round(100 * (ratio - 1));
}

export default function Page() {
  const [a, setA] = useState('');
  const [b, setB] = useState('');

  const [comparisons, setComparisons] = useState<Comparison[]>([]);
  const [isLoading, setIsLoading] = useState(false)
  const [loaded, setLoaded] = useState(false);

  const reset = useCallback(() => {
    setA('');
    setB('');
    setIsLoading(false);
    setLoaded(false);
    setComparisons([])
  }, [setA, setB, setIsLoading, setLoaded])

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
        <form action={['',encodeURIComponent(a),encodeURIComponent(b)].join('/')}>
          <HStack my={4}>
            <InputGroup>
              <InputLeftAddon>
                First Item("A")
              </InputLeftAddon>
              <Input type="text"
                     disabled={isLoading || loaded}
                     value={a}
                     placeholder="ex: 'apples', 'Honda Fit', 'David Lee Roth'"
                     onChange={(e) => setA(e.target.value)}
              />
            </InputGroup>
            <InputGroup>
              <InputLeftAddon>Second Item("B")</InputLeftAddon>
              <Input type="text"
                     value={b}
                     placeholder="ex: 'oranges', 'Tesla Roadster', 'Jimi Hendrix'"
                     disabled={isLoading || loaded}
                     onChange={(e) => setB(e.target.value)}
              />
            </InputGroup>
            <Box flex={0}>
              <Button disabled={(isLoading) || (!(a && b))} colorScheme="green"
                      type="submit"
              >
                Compare &rarr;
              </Button>
            </Box>
          </HStack>


        </form>
      </Box>
    </Box>
  )
}
