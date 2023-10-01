'use client';
import YAML from 'yaml'
import { Fragment, useCallback, useMemo, memo, useState, useEffect, ChangeEventHandler, ChangeEvent } from 'react';

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
import InputForm from '~/components/InputForm'

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
                   action={['',encodeURIComponent(a),encodeURIComponent(b)].join('/')}
                   label={<span>  Compare &rarr;</span>} />
      </Box>
    </Box>
  )
}
