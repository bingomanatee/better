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
  Spinner,
  Table, Tbody, Td,
  Th, Thead,
  Tr,
  Text, VStack
} from '@chakra-ui/react'
import { throttle, sortBy } from 'lodash'
import Comparison, { ComparisonProps } from '~/lib/Comparison'

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

const CompareRow = memo(function CompreRowBase({ comp, a, b }: { comp: Comparison, a: string, b: string }) {
  return (
    <Fragment key={comp.feature}>
      <Tr>
        <Td><Heading m={0} size="sm">{comp.feature}</Heading>
          <Text textStyle="feature-description">{comp.description}</Text>
        </Td>
        <Td backgroundColor={comp.aWon ? 'a-lt' : 'white'}>
          {comp.aWon ? <Text textStyle="a-won">{comp.value}</Text> : ''}
        </Td>
        <Td backgroundColor={comp.aWon ? 'a-lt' : 'white'}>
          <Text textStyle="feature-item"> {comp.a}</Text>
        </Td>
        <Td backgroundColor={comp.bWon ? 'b-lt' : 'white'}>
          {comp.bWon ? <Text textStyle="b-won">{comp.value}</Text> : ''}
        </Td>
        <Td backgroundColor={comp.bWon ? 'b-lt' : 'white'}>
          <Text textStyle="feature-item">   {comp.b}</Text>
        </Td>
      </Tr>

      <Tr>
        <Td colSpan={4}>
        </Td>
      </Tr>
    </Fragment>
  );
})

const reset = () => {
  document.location.href = '/'
}


export default function Page({ params }: {params: {a: string, b: string}}) {
  const a = decodeURIComponent(params.a);
  const b = decodeURIComponent(params.b);

  const [comparisons, setComparisons] = useState<Comparison[]>([]);
  const [isLoading, setIsLoading] = useState(false)
  const [loaded, setLoaded] = useState(false);
  const [readFromCache, setReadFromCache]= useState(false);
  useEffect(() => {
    if (comparisons.length && loaded && !readFromCache) {
      fetch(`/api/stored/${encodeURIComponent(a)}/${encodeURIComponent(b)}`, {
        method: 'put',
        body: JSON.stringify(comparisons)
      }).then(async (response) => {
        const json = await response.json();
      }).catch((err) => {
        console.error('error putting comps:', err);
      })
    }
  }, [comparisons, loaded, readFromCache])

  const load = useCallback(async () => {
    if (!(a && b)) {
      return;
    }

    setIsLoading(true);

    try {

      const response = await fetch(`/api/stored/${encodeURIComponent(a)}/${encodeURIComponent(b)}`)
      const json = await response.json();

      if (json.comparisons?.length) {
        setReadFromCache(true);
        setLoaded(true);
        setIsLoading(false);
        setComparisons(json.comparisons.map((info: ComparisonProps) => new Comparison(info, a, b)));
        return;
      }

    } catch (err) {
      console.error('error fetching cache', err);
    }

    const { body } = await fetch('/api/chat', { method: 'post', body: JSON.stringify({ a, b }) });
    const reader = body?.getReader();
    if (!reader) {
      console.error('no reader');
      return;
    }
    let yml = '';

    function parseYml(final?: boolean) {
      if (final && !comparisons.length) {
        console.log('--- attempting to parse problematic content:', yml);
        let oldYml = yml;
        let lines = yml.split(/[\n\r]/g);
        let start = lines.findIndex((string) =>/^```/.test(string));
        if(start > -1) {
          const end = lines.slice(start + 1).findIndex((string) => /```$/.test(string)) + start;
          yml = lines.slice(start + 1, end + 1).join("\n");
          console.log('yml for lines', start, end, 'of', oldYml, '------------is------', yml);
        }
      }
      try {
        const data = YAML.parse(yml);
        if (Array.isArray(data)) {
          const newComparison = data.map(item => new Comparison(item, a, b));

          const merged = newComparison.reduce((comps: Comparison[], item: Comparison) => {
            const oldComps = comps.filter((old) => old.feature !== item.feature);
            return [...oldComps, item];
          }, comparisons);
          setComparisons(sortBy(merged, 'feature'))
        }
      } catch (err) {
         // console.error('error parsing yml:', err, yml);
      }
    }

    const parseYmlThrottled = throttle(parseYml, 800);

    let stop = false
    do {
      const { done, value } = await reader.read();
      if (done) {
        stop = true
        break;
      } else {
        yml = `${yml}${decoder.decode(value)}`;
        parseYmlThrottled();
      }
    } while (!stop);

    parseYml(true);
    setIsLoading(false);
    setLoaded(true);
  }, [a, b, setIsLoading, setLoaded])

  useEffect(() => {
    if (a && b) {
      setTimeout(load, 200);
    }
    if (!(a && b)) {
      document.location.href = "/"; //@TODO: use router
    }
  }, [a, b]);

  const pointsForA = useMemo(() => {
    return comparisons.reduce((v, c) => {
      if (c.aWon) {
        return c.value + v;
      }
      return v;
    }, 0);
  }, [comparisons]);

  const pointsForB = useMemo(() => {
    return comparisons.reduce((v, c) => {
      if (c.bWon) {
        return c.value + v;
      }
      return v;
    }, 0);

  }, [comparisons]);

  // both of these are false in a draw
  const aWon = pointsForA > pointsForB;
  const bWon = pointsForB > pointsForA;
  const difference = diff(pointsForA, pointsForB);

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
        <form action="/">
          <HStack my={4}>
            <InputGroup>
              <InputLeftAddon>
                First Item("A")
              </InputLeftAddon>
              <Input type="text"
                     disabled={isLoading || loaded}
                     value={a}
                     placeholder="ex: 'apples', 'Honda Fit', 'David Lee Roth'"
              />
            </InputGroup>
            <InputGroup>
              <InputLeftAddon>Second Item("B")</InputLeftAddon>
              <Input type="text"
                     value={b}
                     placeholder="ex: 'oranges', 'Tesla Roadster', 'Jimi Hendrix'"
                     disabled={isLoading || loaded}
              />
            </InputGroup>
            <Box flex={0}>
              <Button colorScheme="blue"
                      type="submit"
              >
                &larr; Clear your choices
              </Button>
            </Box>
          </HStack>
        </form>
        {isLoading ? (<VStack spacing={4}>
            <Spinner size="xl" emptyColor="blackAlpha.200" color="teal.600"/>
            <Text size="sm" fontSize="sm">ChatGPT is thinking about the options --- please wait</Text>
          </VStack>)
          : null}
      </Box>
      {comparisons.length ? (
        <Fragment>
          <Table sx={{ tableLayout: 'fixed' }} variant="unstyled" w="100%">

            <Thead>
              <Tr>
                <Th width={'300px'}>Feature</Th>
                <Th width="75px">&nbsp;</Th>
                <Th color="a">
                  {a}
                </Th>
                <Th width="75px">&nbsp;</Th>
                <Th color="b">
                  {b}
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              <Tr>
                <Td><Heading m={0} size="sm">Overall</Heading>
                  {aWon ? <Text textStyle="a-won">{a} {difference ? ` (${difference}%)` : ''}</Text> : ""}
                  {bWon ? <Text textStyle="b-won">{b} {difference ? ` (${difference}%)` : ''}</Text> : ""}

                </Td>
                <Td backgroundColor="a"><Text textStyle="overall">{pointsForA}</Text></Td>
                <Td backgroundColor="a">
                  <Text textStyle="overall">{comparisons.filter(c => c.aWon).map(c => c.feature).join(', ')}</Text>
                </Td>
                <Td backgroundColor="b"><Text textStyle="overall">{pointsForB}</Text></Td>
                <Td backgroundColor="b">
                  <Text textStyle="overall">{comparisons.filter(c => c.bWon).map(c => c.feature).join(', ')}</Text>
                </Td>
              </Tr>

              {comparisons.filter(c => c.isValid).map((comp) => (
                <CompareRow key={comp.feature} comp={comp} a={a} b={b}/>
              ))
              }
            </Tbody>
          </Table>

        </Fragment>) : null
      }
    </Box>
  )
}
