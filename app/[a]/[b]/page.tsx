'use client';
import YAML from 'yaml'
import { useCallback, useEffect, useState } from 'react';

import { Box, CloseButton, Heading, HStack, Spinner, Text, useConst, VStack } from '@chakra-ui/react'
import { debounce, throttle } from 'lodash'
import Comparison, { ComparisonProps } from '~/lib/Comparison'
import InputForm from '~/components/InputForm'
import { ChoiceTable } from './ChoiceTable'
import { useRouter } from 'next/navigation'
import { fetchGPTresponses } from '~/lib/fetchGPTresponses'

const reset = () => {
  document.location.href = '/'
}


export default function Page({ params }: { params: { a: string, b: string } }) {
  const router = useRouter();
  const a = decodeURIComponent(params.a);
  const b = decodeURIComponent(params.b);

  const [comparisons, setComparisons] = useState<Comparison[]>([]);
  const [isLoading, setIsLoading] = useState(false)
  const [loaded, setLoaded] = useState(false);
  const [readFromCache, setReadFromCache] = useState(false);

  const STORED_URL = `/api/stored/${encodeURIComponent(a)}/${encodeURIComponent(b)}`;

  // when complete, store the comparisons in the cache -- unless they were retrieved FROM the cache...
  useEffect(() => {
    if (comparisons.length && loaded && !readFromCache) {
      fetch(STORED_URL, {
        method: 'put',
        body: JSON.stringify(comparisons)
      }).then(async (response) => {
        const json = await response.json();
        console.log('stored comparisons response:', json);
      }).catch((err) => {
        console.error('error putting comps:', err);
      })
    }
  }, [comparisons, loaded, readFromCache, STORED_URL])

  const load = useCallback(async () => {
    if (!(a && b)) {
      return;
    }

    setIsLoading(true);

    try {
      // if there has already been a pair like this asked, it will be cached;
      // use that cache instead of hitting up ChatGPT
      const response = await fetch(STORED_URL)
      const json = await response.json();

      if (json.comparisons?.length) {
        console.log('CACHED RESULT USED: ', json);
        setReadFromCache(true);
        setLoaded(true);
        setIsLoading(false);
        setComparisons(json.comparisons.map((info: ComparisonProps) => new Comparison(info, a, b)));
        return;
      }
    } catch (err) {
      console.error('error fetching cache', err);
    }

    // --- if the cache result is not found ---- load from ChatGPT

    console.log('---- did not cet cache: getting chat GPT for ', a, b);
    const iter = fetchGPTresponses(a, b);
    const setComparisonsT = throttle(setComparisons, 1500);
    const setComparisonsD = debounce(setComparisons, 800);
    let result;
    do {
      result = await iter.next();
      if (!result) {
        break
      }

      console.log('result is', result);
      if (result.value && Array.isArray(result.value)) {
        // we both want to emit at least every half second (throttle)
        // AND make sure we get the last data(debounce);
        setComparisonsT(result.value);
        setComparisonsD(result.value);
      }
    } while (!result.done);

    setIsLoading(false);
    setLoaded(true);
  }, [a, b, setIsLoading, setLoaded])

  useEffect(() => {
    if (a && b) {
      setTimeout(load, 200);
    }
    if (!(a && b)) {
      router.push('/');
    }
  }, [a, b, router]);

  const erase = useCallback(() => {
    fetch(STORED_URL, { method: 'DELETE' }).then(() => router.push('/'));
  }, []);

  return (
    <Box>
      <Box as="main" p={5}>
        <HStack w="100%" justify="space-between">
          <Heading>
            Ask OpenAI: Which is better
          </Heading>
          <CloseButton onClick={erase} title="erase this key - will no longer show up on home page"/>
        </HStack>
        <Text size="lg" fontSize="lg" my={6}>
          Compare two things! enter two items to compare their worth -- such as "Apples" and "Oranges",
          "Tesla Roadster" and "Honda Fit"
        </Text>

        <InputForm a={a}
                   b={b}
                   action="/"
                   buttonColor="blue"
                   label={<span>&larr;  Choose Another Pair</span>}/>

        {isLoading ? (
            <VStack spacing={4}>
              <Spinner size="xl" emptyColor="blackAlpha.200" color="teal.600"/>
              <Text size="sm" fontSize="sm">ChatGPT is thinking about the options --- please wait</Text>
            </VStack>
          )
          : null}
      </Box>
      {comparisons.length ? (<ChoiceTable comparisons={comparisons} a={a} b={b}/>) : null}
    </Box>
  )
}
