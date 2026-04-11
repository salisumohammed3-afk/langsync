import { generateIdeasForModel } from '@/lib/ai-service';
import type { DimensionKey, ModelSource } from '@/types';

export const maxDuration = 60;

export async function POST(request: Request) {
  const body = await request.json();
  const { analysis_id, company_name, description, scores } = body as {
    analysis_id: string;
    company_name: string;
    description: string;
    scores: Partial<Record<DimensionKey, number>>;
  };

  if (!analysis_id || !company_name) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      const models: ModelSource[] = ['claude', 'chatgpt', 'gemini'];

      // Start all models in parallel
      send({ type: 'start', models });

      const promises = models.map(async (model) => {
        send({ type: 'model_start', model });
        try {
          const ideas = await generateIdeasForModel(
            model,
            analysis_id,
            company_name,
            description,
            scores
          );
          send({ type: 'model_complete', model, ideas, count: ideas.length });
          return ideas;
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Unknown error';
          console.error(`${model} failed:`, message);
          send({ type: 'model_error', model, error: message });
          return [];
        }
      });

      const results = await Promise.allSettled(promises);
      const allIdeas = results.flatMap((r) =>
        r.status === 'fulfilled' ? r.value : []
      );

      send({ type: 'complete', totalIdeas: allIdeas.length });
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
