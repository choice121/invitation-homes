import { ApplicationApiEnvironment, handleApplicationVerification, handleApplicationVerificationConfirmation } from '../../../src/services/applicationApi';

interface PagesFunctionContext {
  request: Request;
  env: ApplicationApiEnvironment;
}

export async function onRequestGet({ request, env }: PagesFunctionContext): Promise<Response> {
  return handleApplicationVerification(request, env);
}

export async function onRequestPost({ request, env }: PagesFunctionContext): Promise<Response> {
  return handleApplicationVerificationConfirmation(request, env);
}
