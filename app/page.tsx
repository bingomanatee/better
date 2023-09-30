'use client';
import YAML from 'yaml'
import { Fragment, useCallback, useMemo, memo, useState } from 'react';

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
import Comparison from '../lib/Comparison'

const decoder = new TextDecoder();

function diff(a: number, b: number) {
  if (!a || !b || (a === b)) return 0;
  let greater = Math.max(a, b);
  let lesser = Math.min(a, b);
  const ratio = greater / lesser;
  return Math.round(100 * (ratio - 1));
}

const CompareRow = memo(function CompreRowBase({ comp, a, b }: { comp: Comparison, a: string, b: string }){
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

export default function Page() {
  const [a, setA] = useState('apples');
  const [b, setB] = useState('oranges');

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

  const onSubmit = async (e: any) => {
    console.log('submitting', a, b);
    setIsLoading(true);

    e.preventDefault();
    if (!(a && b)) {
      return;
    }
    const { body } = await fetch('/api/chat', { method: 'post', body: JSON.stringify({ a, b }) });
    const reader = body?.getReader();
    if (!reader) {
      console.error('no reader');
      return;
    }
    let yml = '';

    function parseYml() {
      try {
        const data = YAML.parse(yml);
        console.log('parsed data:', data);
        if (Array.isArray(data)) {
          const newComparison = data.map(item => new Comparison(item, a, b));

          const merged = newComparison.reduce((comps: Comparison[], item: Comparison) => {
            const oldComps = comps.filter((old) => old.feature !== item.feature);
            return [...oldComps, item];
          }, comparisons);
          setComparisons(sortBy(merged, ['feature']))
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

    parseYml();
    setIsLoading(false);
    setLoaded(true);
  };

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

  }, [comparisons])

  const aWon = pointsForA > pointsForB;
  const bWon = pointsForB > pointsForA;
  const difference = diff(pointsForA, pointsForB);
  return (
    <Box>
      <Box as="main" p={20}>
        <Heading>
          Which is better
        </Heading>
        <Text size="lg" fontSize="lg" my={6}>
          Compare two things! enter two items to compare their worth -- such as "Apples" and "Oranges",
          "Tesla Roadster" and "Honda Fit"
        </Text>
        <form onSubmit={onSubmit}>
          <HStack my={4}>
            <InputGroup>
              <InputLeftAddon>
                First Item("A")
              </InputLeftAddon>
              <Input type="text"
                     disabled={isLoading || loaded}
                     value={a}
                     onChange={(e) => setA(e.target.value)}
              />
            </InputGroup>
            <InputGroup>
              <InputLeftAddon>Second Item("B")</InputLeftAddon>
              <Input type="text"
                     value={b}
                     disabled={isLoading || loaded}
                     onChange={(e) => setB(e.target.value)}
              />
            </InputGroup>
            <Box flex={0}>
              <Button disabled={isLoading} colorScheme="green"
                      type="submit"
              >
                Compare the things &rarr;
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
          <HStack justify="center">
            <Button colorScheme="blue"
                    type="button"
                    onClick={reset}
            >
              Clear your choices &rarr;
            </Button>
          </HStack>
        </Fragment>) : null
      }
    </Box>
  )
}
