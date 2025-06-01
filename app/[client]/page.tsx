import { notFound } from 'next/navigation';
import fs from 'fs';
import path from 'path';

export default async function ClientPage({ params }: { params: { client: string } }) {
  const { client } = params;

  try {
    const dataPath = path.join(process.cwd(), 'data', `${client}.json`);
    const configPath = path.join(process.cwd(), 'configs', `${client}.config.ts`);

    const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    const config = (await import(`../../../configs/${client}.config`)).default;

    const result = config.formula(data.input);

    return (
      <main className="p-8">
        <h1 className="text-3xl font-bold mb-4">{config.clientName}</h1>
        <section>
          <h2 className="text-xl font-semibold mt-4">Results</h2>
          <pre>{JSON.stringify(data.results, null, 2)}</pre>

          <h2 className="text-xl font-semibold mt-4">Methodology</h2>
          <p>{data.methodology}</p>

          <h2 className="text-xl font-semibold mt-4">Calculated Output</h2>
          <p>Result: {result}</p>

          <h2 className="text-xl font-semibold mt-4">Limitations</h2>
          <p>{data.limitations}</p>
        </section>
      </main>
    );
  } catch {
    notFound();
  }
}
