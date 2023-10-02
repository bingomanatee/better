import Comparison from '~/lib/Comparison'
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Heading,
  HStack,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useBreakpointValue,
  VStack
} from '@chakra-ui/react'
import { useMemo } from 'react'
import { CompCard } from './CompCard'
import { CompareRow } from './CompareRow'

function diff(a: number, b: number) {
  if (!a || !b || (a === b)) {
    return 0;
  }
  let greater = Math.max(a, b);
  let lesser = Math.min(a, b);
  const ratio = greater / lesser;
  return Math.round(100 * (ratio - 1));
}

export function ChoiceTable({ comparisons, a, b }: { comparisons: Comparison[], a: string, b: string }) {
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
      <VStack width="100%" spacing={2} justifyContent="stretch">
        <Card width="100%">
          <CardHeader>
            <HStack>
              {aWon ? <Text textStyle="a-won">Overall: {a} {difference ? ` (${difference}%)` : ''}</Text> : ""}
              {bWon ? <Text textStyle="b-won">Overall: {b} {difference ? ` (${difference}%)` : ''}</Text> : ""}
              {(!aWon && !bWon) ? <Text>Draw</Text> : ''}
            </HStack> </CardHeader>
          <CardBody p={0}>

            <Box backgroundColor="a" px={3} py={1}>
              <HStack> <Text fontWeight="bold" textStyle="overall-sm">{a}</Text>
                <Text textStyle="overall-sm">{pointsForA}</Text></HStack>
              <Text textAlign="center"
                    textStyle="overall-sm">{comparisons.filter(c => c.aWon).map(c => c.feature).join(', ')}</Text>
            </Box>
            <Box backgroundColor="b" px={3} py={1}>
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
          <CompareRow
            key={comp.feature}
            awon={comp.aWon}
            bwon={comp.bWon}
            compa={comp.a}
            compb={comp.b}
            description={comp.description}
            feature={comp.feature}
            old={comp.old}
            value={comp.value}/>
        ))
        }
      </Tbody>
    </Table>
  )
}
