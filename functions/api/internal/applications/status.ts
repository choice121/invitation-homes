import { ApplicationApiEnvironment, handleApplicationStatusUpdate } from '../../../../src/services/applicationApi';

interface PagesFunctionContext {
  request: Request;
  env: ApplicationApiEnvironment;
}

export async function onRequestPost({ request, env }: PagesFunctionContext): Promise<Response> {
  return handleApplicationStatusUpdate(request, env);
}
