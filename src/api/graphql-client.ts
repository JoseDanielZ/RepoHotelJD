import { ApolloClient, InMemoryCache, from } from '@apollo/client';
import { createHttpLink } from '@apollo/client/link/http';
import { SetContextLink } from '@apollo/client/link/context';

const API_BASE = process.env.EXPO_PUBLIC_API_BASE ?? 'http://localhost:5104';

// In-memory token cache reference — same as the one in client.ts
// Apollo reads the token at request time via SetContextLink
let _apolloAccessToken: string | null = null;

export function setApolloTokenCache(access: string | null) {
  _apolloAccessToken = access;
}

const httpLink = createHttpLink({
  uri: `${API_BASE}/graphql`,
});

const authLink = new SetContextLink((prevContext) => ({
  headers: {
    ...prevContext.headers,
    authorization: _apolloAccessToken ? `Bearer ${_apolloAccessToken}` : '',
  },
}));

export const apolloClient = new ApolloClient({
  link: from([authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: { fetchPolicy: 'cache-and-network' },
  },
});
