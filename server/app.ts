import compression from 'compression';
import express, { type Express, type NextFunction, type Request, type Response } from 'express';
import path from 'path';
import { createApiController } from './controllers/apiController.ts';
import {
  apiNoStoreMiddleware,
  payloadLimitMiddleware,
  securityHeadersMiddleware,
} from './middleware/security.ts';
import { ResourceRepository } from './repositories/resourceRepository.ts';
import { FileStorageAdapter } from './repositories/storageAdapter.ts';
import { ResourceService } from './services/resourceService.ts';

export interface CreateAppOptions {
  repository?: ResourceRepository;
  apiKeyOverride?: string;
}

export function createApp(options: CreateAppOptions = {}): Express {
  const app = express();
  app.disable('x-powered-by');

  const storePath = path.resolve(process.cwd(), '.data', 'aeroshield-store.json');
  const repository = options.repository ?? new ResourceRepository(new FileStorageAdapter(storePath));
  const resourceService = new ResourceService(repository);
  const controller = createApiController(resourceService, options.apiKeyOverride);

  app.use(compression());
  app.use(securityHeadersMiddleware);
  app.use(express.json({ limit: '16kb' }));

  const apiRouter = express.Router();
  apiRouter.use(apiNoStoreMiddleware);
  apiRouter.use(payloadLimitMiddleware);

  apiRouter.get('/health', controller.getHealth);
  apiRouter.get('/verticals', controller.getVerticals);
  apiRouter.get('/resources', controller.listResources);
  apiRouter.post('/resources', controller.createResource);
  apiRouter.put('/resources/:id', controller.updateResource);
  apiRouter.delete('/resources/:id', controller.deleteResource);
  apiRouter.post('/advisor/plan', (req, res) => {
    void controller.postAdvisorPlan(req, res);
  });

  app.use('/api', apiRouter);

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof SyntaxError) {
      res.status(400).json({ error: 'Malformed JSON request payload.' });
      return;
    }
    res.status(500).json({ error: 'Unexpected server error.' });
  });

  return app;
}
