'use client';
import YAML from 'yaml'
import { Fragment, useCallback, useMemo, memo, useState, useEffect } from 'react';

import {
  Box,
  Heading,
  HStack,
  Spinner,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Text,
  VStack,
  useBreakpointValue,
  Card,
  CardHeader,
  CardBody,
  PopoverContent,
  PopoverCloseButton,
  PopoverBody,
  PopoverArrow, Popover, PopoverTrigger, CardFooter
} from '@chakra-ui/react'
import { throttle, sortBy } from 'lodash'
import Comparison, { ComparisonProps } from '~/lib/Comparison'
import InputForm from '~/components/InputForm'
import { QuestionIcon } from '@chakra-ui/icons'

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

const CompareRow = memo(function CompareRowBase({ comp, a, b }: { comp: Comparison, a: string, b: string }) {
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

function FeatureBox(props: { side: string, comparison: Comparison, name: string }) {
  const { comparison, side, name } = props
  const won = comparison.getWon(side) as boolean;

  return <Box p={1} px={3} borderRadius={2} backgroundColor={won ? `${side}-lt` : 'white'}>
    <Text> {comparison.getComp(side)}</Text>
    {won ? (<HStack spacing={4} p={2} width="100%" justifyContent="end">
      <Text>Winner: {name}</Text>
      <Text textStyle={`${side}-won`}>{comparison.value}</Text>
    </HStack>) : ''}

  </Box>
}

function CompCard({ comparison, a, b }: { comparison: Comparison, a: string, b: string }) {

  return (
    <Card w="100%" size="sm">
      <CardHeader>
        <Popover>
          <PopoverTrigger>
            <HStack justify="stretch" spacing={2} w="100%">
              <Heading size="sm" textAlign="center">{comparison.feature}</Heading>
              <QuestionIcon color="blue"/>
            </HStack>
          </PopoverTrigger>
          <PopoverContent>
            <PopoverArrow/>
            <PopoverCloseButton/>
            <PopoverBody>
              <Box p={2}>
                <Text textStyle="feature-description">  {comparison.description} </Text>
              </Box>
            </PopoverBody>
          </PopoverContent>
        </Popover>
      </CardHeader>
      <CardBody py={0}>
        <FeatureBox comparison={comparison} side="a" name={a}/>
        <FeatureBox comparison={comparison} side="b" name={b}/>
      </CardBody>
    </Card>
  )
}


function ChoiceTable({ comparisons, a, b }: { comparisons: Comparison[], a: string, b: string }) {
  const direction = useBreakpointValue(
    {
      base: 'vertical',
      lg: 'horizontal'
    },
    {
      fallback: 'lg',
    },
  )

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

  if (direction === 'vertical') {
    return (
      <VStack width="100%" spacing={2}>
        <Card>
          <CardHeader>
            <HStack>
              {aWon ? <Text textStyle="a-won">Overall: {a} {difference ? ` (${difference}%)` : ''}</Text> : ""}
              {bWon ? <Text textStyle="b-won">Overall: {b} {difference ? ` (${difference}%)` : ''}</Text> : ""}
              {(!aWon && !bWon) ? <Text>Draw</Text> : ''}
            </HStack> </CardHeader>
          <CardBody p={0}>

            <Box backgroundColor="a">
              <HStack> <Text fontWeight="bold" textStyle="overall-sm">{a}</Text>
                <Text textStyle="overall-sm">{pointsForA}</Text></HStack>
              <Text textAlign="center"
                    textStyle="overall-sm">{comparisons.filter(c => c.aWon).map(c => c.feature).join(', ')}</Text>
            </Box>
            <Box backgroundColor="b">
              <HStack> <Text fontWeight="bold" textStyle="overall-sm">{b}</Text>
                <Text textStyle="overall-sm">{pointsForB}</Text></HStack>
              <Text textAlign="center"
                    textStyle="overall-sm">{comparisons.filter(c => c.bWon).map(c => c.feature).join(', ')}</Text>
            </Box>
          </CardBody>
        </Card>
        {comparisons.map((comp) => <CompCard a={a} b={b} key={comp.feature} comparison={comp}/>)}
      </VStack>
    )
  }

  return (
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
  )
}

const reset = () => {
  document.location.href = '/'
}


export default function Page({ params }: { params: { a: string, b: string } }) {
  const a = decodeURIComponent(params.a);
  const b = decodeURIComponent(params.b);

  const [comparisons, setComparisons] = useState<Comparison[]>([]);
  const [isLoading, setIsLoading] = useState(false)
  const [loaded, setLoaded] = useState(false);
  const [readFromCache, setReadFromCache] = useState(false);

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
      // if there has already been a pair like this asked, it will be cached;
      // use that cache instead of hitting up ChatGPT
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

    let body;
    try {
      const response = await fetch('/api/chat', { method: 'post', body: JSON.stringify({ a, b }) });
      body = response.body;
    } catch (err) {
      return document.location = '/';
    }
    const reader = body?.getReader();
    if (!reader) {
      return;
    }
    let yml = '';

    function parseYml(final?: boolean) {
      if (final && !comparisons.length) {
        console.log('--- attempting to parse problematic content:', yml);
        let oldYml = yml;
        let lines = yml.split(/[\n\r]/g);
        let start = lines.findIndex((string) => /^```/.test(string));
        if (start > -1) {
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
