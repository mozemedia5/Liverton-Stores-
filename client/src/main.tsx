import { UNAUTHED_ERR_MSG } from '@shared/const';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink, TRPCClientError } from '@trpc/client';
import { createRoot } from 'react-dom/client';
import superjson from 'superjson';
import App from './App';
import { startLogin } from './const';
import { getFirebaseAuth } from './lib/firebase';
import { trpc } from './lib/trpc';
import { CartProvider } from './contexts/CartContext';
import './index.css';

const queryClient = new QueryClient();
const redirectToLoginIfUnauthorized = (error: unknown) => { if (!(error instanceof TRPCClientError) || typeof window === 'undefined') return; if (error.message === UNAUTHED_ERR_MSG) startLogin(); };
queryClient.getQueryCache().subscribe((event) => { if (event.type === 'updated' && event.action.type === 'error') redirectToLoginIfUnauthorized(event.query.state.error); });
queryClient.getMutationCache().subscribe((event) => { if (event.type === 'updated' && event.action.type === 'error') redirectToLoginIfUnauthorized(event.mutation.state.error); });
const trpcClient = trpc.createClient({ links: [httpBatchLink({ url: '/api/trpc', transformer: superjson, async headers() { const user = getFirebaseAuth()?.currentUser; const token = user ? await user.getIdToken() : null; return token ? { Authorization: `Bearer ${token}` } : {}; }, fetch(input, init) { return globalThis.fetch(input, { ...(init ?? {}), credentials: 'include' }); } })] });

if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => undefined));

createRoot(document.getElementById('root')!).render(<trpc.Provider client={trpcClient} queryClient={queryClient}><QueryClientProvider client={queryClient}><CartProvider><App /></CartProvider></QueryClientProvider></trpc.Provider>);
