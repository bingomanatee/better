import Comparison from '~/lib/Comparison'
import {
  Box,
  Card,
  CardBody,
  CardHeader, Divider,
  Heading,
  HStack,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverTrigger,
  Text
} from '@chakra-ui/react'
import { QuestionIcon } from '@chakra-ui/icons'
import { memo } from 'react'

function FeatureBox(props: { side: string, won: boolean, value: number, desc: string, name: string }) {
  const { won, desc, value, side, name } = props

  return <Box p={1} px={3} borderRadius={2} backgroundColor={won ? `${side}-lt` : 'white'}>
    <Text> {desc}</Text>
    {won ? (<HStack spacing={4} p={2} width="100%" justifyContent="end">
      <Text>Winner: {name}</Text>
      <Text textStyle={`${side}-won`}>{value}</Text>
    </HStack>) : ''}

  </Box>
}

const FeatureBoxM = memo(FeatureBox);

export function CompCard({ comparison, a, b }: { comparison: Comparison, a: string, b: string }) {

  if (comparison.old) {
    return null;
  }

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
        <FeatureBoxM won={comparison.aWon} value={comparison.value} desc={comparison.a} side="a" name={a}/>
        <Divider/>
        <FeatureBoxM won={comparison.bWon} value={comparison.value} desc={comparison.b} side="b" name={b}/>
      </CardBody>
    </Card>
  )
}
