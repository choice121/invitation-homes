import { ApplicationApiEnvironment, handleApplicationSubmission } from '../../src/services/applicationApi';

interface PagesFunctionContext {
  request: Request;
  env: ApplicationApiEnvironment;
}

export async function onRequestPost({ request, env }: PagesFunctionContext): Promise<Response> {
  const clientKey = request.headers.get('cf-connecting-ip') || 'cloudflare-client';
  return handleApplicationSubmission(request, env, clientKey);
}
