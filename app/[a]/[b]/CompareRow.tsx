import { Fragment, memo } from 'react'
import Comparison from '~/lib/Comparison'
import { Heading, Td, Text, Tr } from '@chakra-ui/react'

type RowProps = {
  awon: boolean,
  bwon: boolean,
  compa: string,
  compb: string,
  description: string,
  feature: string,
  value: number,
  old: boolean
}
export const CompareRow = memo(function CompareRowBase({
                                                         awon,
                                                         bwon,
                                                         compa,
                                                         compb,
                                                         value,
                                                         feature,
                                                         description,
                                                         old
                                                       }: RowProps) {
  if (old) {
    return null;
  }

  return (
    <Fragment key={feature}>
      <Tr>
        <Td><Heading m={0} size="sm">{feature}</Heading>
          <Text textStyle="feature-description">{description}</Text>
        </Td>
        <Td backgroundColor={awon ? 'a-lt' : 'white'}>
          {awon ? <Text textStyle="a-won">{value}</Text> : ''}
        </Td>
        <Td backgroundColor={awon ? 'a-lt' : 'white'}>
          <Text textStyle="feature-item"> {compa}</Text>
        </Td>
        <Td backgroundColor={bwon ? 'b-lt' : 'white'}>
          {bwon ? <Text textStyle="b-won">{value}</Text> : ''}
        </Td>
        <Td backgroundColor={bwon ? 'b-lt' : 'white'}>
          <Text textStyle="feature-item">   {compb}</Text>
        </Td>
      </Tr>
    </Fragment>
  );
})
