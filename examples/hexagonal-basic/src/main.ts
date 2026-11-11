import { createServer } from 'node:http';
import { createUseCases } from './container.ts';
import { createShortLinkHttpHandler } from './presentation/http/shortLinkHttpHandler.ts';

// Entry point: read configuration, build the object graph, start the adapter.
const port = Number(process.env.PORT ?? 3000);
const useCases = createUseCases({ dataFile: process.env.DATA_FILE });

createServer(createShortLinkHttpHandler(useCases)).listen(port, () => {
  console.log(`Short links listening on http://localhost:${port}`);
});
