import { Metadata } from 'next';
import '../styles/globals.css';
import { ChakraProviders } from '../components/ChakraProviders'

const title = 'Which is Better?';
const description = 'Comparing things with Chat GPT';

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    locale: 'en_US',
    type: 'website',
  }
};

export default function RootLayout({
                                     children,
                                   }: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
    <head>
      <title>
        Which is better
      </title>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"/>
    </head>
    <body>
    <ChakraProviders>
      {children}
    </ChakraProviders>
    </body>
    </html>
  );
}
