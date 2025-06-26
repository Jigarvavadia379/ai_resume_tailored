import '../styles/globals.css'; // adjust this path if needed
import type { AppProps } from 'next/app';
import '../i18n';

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
