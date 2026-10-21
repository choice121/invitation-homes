import { ApplicationApiEnvironment, handleApplicationNotificationDispatch } from '../../../src/services/applicationApi';

interface PagesFunctionContext {
  request: Request;
  env: ApplicationApiEnvironment;
}

export async function onRequestPost({ request, env }: PagesFunctionContext): Promise<Response> {
  return handleApplicationNotificationDispatch(request, env);
}
