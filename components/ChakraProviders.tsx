'use client'
import { createMultiStyleConfigHelpers, extendTheme } from '@chakra-ui/react'
import { CacheProvider } from '@chakra-ui/next-js'
import { ChakraProvider } from '@chakra-ui/react'
import { checkboxAnatomy } from '@chakra-ui/anatomy'

const LAYER_STYLES = [];

const COLORS = {
  accent: 'hsl(30,100%,50%)',
  'accent-dk': 'hsl(30,100%,33%)',
  'x-accent-dk': 'hsl(30,50%,25%)',
  'accent-lt': 'hsl(30,100%,75%)',
  'accent-xl': 'hsl(30,100%,85%)',

  'a-won': 'hsl(283,76%,30%)',
  'a': 'hsl(283,76%,40%)',
  'a-lt': 'hsl(283,76%,80%)',

  'b-won': 'hsl(180,76%,20%)',
  'b': 'hsl(180,76%,33%)',
  'b-lt': 'hsl(180,76%,80%)',

  'form-title': 'hsl(244,50%,25%)',
  'nav-x-light': 'hsl(200,100%,90%)',
  'nav-light': 'hsl(200,86%,80%)',
  'nav': 'hsl(200,55%,50%)',
  'nav-alpha-lt': 'hsla(200,55%,50%, 0.10)',
  'nav-alpha': 'hsla(200,55%,50%, 0.4)',
  'nav-dark': 'hsl(200,100%,25%)',
  'nav-dark-alpha': 'hsla(200,100%,25%, 0.333)',
  'nav-x-dark': 'hsl(200,100%,12.5%)',
  'button-back': 'hsl(30,0%,85%)',
  'active-button': 'hsl(30,100%,75%)',
  'active-button-bg': 'hsl(30,100%,33%)',
  'inactive-button': 'hsl(150,20%,50%)',
  'inactive-button-bg': 'hsl(150,20%,25%)',
};

const BUTTONS = {};

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(checkboxAnatomy.keys)

const CheckboxBaseStyle = definePartsStyle({
  // define the part you're going to style

  control: {
    padding: 1, // change the padding of the control
    borderRadius: 0, // change the border radius of the control
    backgroundColor: 'white',
    borderColor: 'black',
    borderWidth: 2,
    mx: 2,
    shadow: 'md'
  },
})

export const checkboxTheme = defineMultiStyleConfig({ baseStyle: CheckboxBaseStyle })

const theme = extendTheme({
  textStyles: {
    'overall': {
      color: 'whiteAlpha.700',
      fontSize: 'lg',
      fontWeight: 'bold'
    },
    'overall-sm': {
      color: 'whiteAlpha.700',
      fontSize: 'md',
      fontWeight: 'bold'
    },
    'feature-item': {
      fontSize: 'lg',
      p:0,
    },
    'a-won': {
      p:0,
      color: 'a-won',
      fontSize: 'lg',
      fontWeight: 'bold'
    },
    'b-won': {
      p:0,
      color: 'b-won',
      fontSize: 'lg',
      fontWeight: 'bold'
    },
    'feature-description': {
      p:0,
      fontStyle: 'italic',
      fontSize: '0.9em',
      color: 'blackAlpha.700',
    }
  },

  colors: COLORS,
  components: {
    IconButton: {
      variants: BUTTONS
    },
    Tr: {
      baseStyle: {
        verticalAlign: 'top'
      }
    },
    Td: {
      baseStyle: {
        verticalAlign: 'top'
      }
    },
    Button: {
      baseStyle: {
        textTransform: 'uppercase',
        fontWeight: 300,
        px: 2,
        py: 0.5,
        borderRadius: '0.333em',
        lineHeight: '100%',
        _hover: {
          shadow: 'dark-lg'
        }
      },

      variants: BUTTONS
    },
    FormLabel: {
      baseStyle: {
        fontStyle: 'italic',
        color: 'form-title',
        fontWeight: 400,
        fontSize: 'sm',
        mb: '2px'
      }
    },
    Checkbox: checkboxTheme,
    Card: {},
    Heading: {
      baseStyle: {},
      variants: {}
    },
    Text: {},
  },

});

export function ChakraProviders({ children }: {
  children: React.ReactNode
}) {
  return (
    <CacheProvider>
      <ChakraProvider theme={theme}>
        {children}
      </ChakraProvider>
    </CacheProvider>
  )
}
