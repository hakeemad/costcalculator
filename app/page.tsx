import { notFound } from "next/navigation";

export default async function ClientPage({ params }: { params: { client: string } }) {
  const { client } = params;

  try {
    const config = (await import(`@/configs/${client}.config`)).default;
    const data = (await import(`@/data/${client}.json`)).default;

    const result = config.formula(data.input);

    return (
      <main className="min-h-screen bg-white px-6 py-12">
        <div className="max-w-4xl mx-auto space-y-12">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{config.clientName}</h1>
            <p className="text-lg text-gray-700 mt-2">
              This is a customised iCount calculator view for: <strong>{config.clientName}</strong>
            </p>
          </div>

          <div className="border rounded-lg p-6 bg-gray-50">
            <h2 className="text-xl font-semibold mb-4">Input Data</h2>
            <pre className="bg-white p-4 rounded shadow-inner text-sm">
              {JSON.stringify(data.input, null, 2)}
            </pre>
          </div>

          <div className="border rounded-lg p-6 bg-gray-50">
            <h2 className="text-xl font-semibold mb-4">Calculation Result</h2>
            <p className="text-lg text-green-700 font-bold">Result: {result}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="border rounded-lg p-4">
              <h3 className="text-md font-semibold mb-2">Results Summary</h3>
              <pre className="text-sm">{JSON.stringify(data.results, null, 2)}</pre>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="text-md font-semibold mb-2">Methodology</h3>
              <p className="text-sm">{data.methodology}</p>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="text-md font-semibold mb-2">Limitations</h3>
              <p className="text-sm">{data.limitations}</p>
            </div>
          </div>
        </div>
      </main>
    );
  } catch (err) {
    console.error("Client app error:", err);
    notFound();
  }
}
