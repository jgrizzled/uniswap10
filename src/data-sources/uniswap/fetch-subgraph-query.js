// parse and dispatch GraphQL query to The Graph

import fetch from 'node-fetch';

const fetchSubgraphQuery = async (subgraph, query) => {
  const strippedQuery = stripGraphQLQuery(query);
  const response = await fetch(
    'https://api.thegraph.com/subgraphs/name/' + subgraph,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: strippedQuery })
    }
  );
  if (!response.ok)
    throw new Error(
      `Error fetching subgraph '${subgraph}' with query: ${query}`
    );
  const responseJSON = await response.json();
  return responseJSON.data;
};

// remove unnecessary chars
const stripGraphQLQuery = graphQLQuery =>
  graphQLQuery
    .replace(/#.*\n/g, '')
    .replace(/[\s|,]*\n+[\s|,]*/g, ' ')
    .replace(/:\s/g, ':')
    .replace(/,\s/g, ',')
    .replace(/\)\s\{/g, '){')
    .replace(/\}\s/g, '}')
    .replace(/\{\s/g, '{')
    .replace(/\s\}/g, '}')
    .replace(/\s\{/g, '{')
    .replace(/\)\s/g, ')')
    .replace(/\(\s/g, '(')
    .replace(/\s\)/g, ')')
    .replace(/\s\(/g, '(')
    .replace(/=\s/g, '=')
    .replace(/\s=/g, '=')
    .replace(/@\s/g, '@')
    .replace(/\s@/g, '@')
    .replace(/\s\$/g, '$')
    .replace(/\s\./g, '.')
    .trim();

export default fetchSubgraphQuery;
