"use client"

import { Box, Button, HStack, Input, InputGroup, InputLeftAddon, useBreakpointValue, VStack } from '@chakra-ui/react'
import { ChangeEventHandler } from 'react'

const NOOP = () => {}

type Props = {
  isDisabled?: boolean,
  a: string,
  b: string,
  action?: string,
  aOnChange?: ChangeEventHandler<HTMLInputElement>,
  bOnChange?: ChangeEventHandler<HTMLInputElement>,
  label: any,
  buttonColor?: string
}
export default function InputForm({
                                    isDisabled,
                                    a, b,
                                    action, aOnChange = NOOP, bOnChange = NOOP,
                                    label = <span>Compare &rarr;</span>,
                                    buttonColor = "green"
                                  }: Props) {

  const direction = useBreakpointValue(
    {
      base: 'vertical',
      lg: 'horizontal'
    },
    {
      fallback: 'lg',
    },
  )

  if (direction === 'vertical') {
    return (
      <form action={action}>
        <VStack my={2} spacing={1}>
          <InputGroup>
            <InputLeftAddon minWidth="100px">
              Item "A"
            </InputLeftAddon>
            <Input type="text"
                   disabled={isDisabled}
                   value={a}
                   placeholder="ex: 'apples', 'Honda Fit', 'David Lee Roth'"
                   onChange={aOnChange}
            />
          </InputGroup>
          <InputGroup>
            <InputLeftAddon minWidth="100px">Item "B"</InputLeftAddon>
            <Input type="text"
                   value={b}
                   placeholder="ex: 'oranges', 'Tesla Roadster', 'Jimi Hendrix'"
                   disabled={isDisabled}
                   onChange={bOnChange}
            />
          </InputGroup>
          <Box flex={0}>
            <Button disabled={isDisabled}
                    colorScheme={buttonColor}
                    type="submit">
              {label}
            </Button>
          </Box>
        </VStack>
      </form>
    )
  }

  return (
    <form action={action}>
      <HStack my={4}>
        <InputGroup>
          <InputLeftAddon>
            First Item("A")
          </InputLeftAddon>
          <Input type="text"
                 disabled={isDisabled}
                 value={a}
                 placeholder="ex: 'apples', 'Honda Fit', 'David Lee Roth'"
                 onChange={aOnChange}
          />
        </InputGroup>
        <InputGroup>
          <InputLeftAddon>Second Item("B")</InputLeftAddon>
          <Input type="text"
                 value={b}
                 placeholder="ex: 'oranges', 'Tesla Roadster', 'Jimi Hendrix'"
                 disabled={isDisabled}
                 onChange={bOnChange}
          />
        </InputGroup>
        <Box flex={0}>
          <Button disabled={isDisabled}
                  colorScheme={buttonColor}
                  type="submit">
            {label}
          </Button>
        </Box>
      </HStack>


    </form>
  )
}
