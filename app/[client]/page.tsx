import { notFound } from 'next/navigation'
import { CostCalculator } from '@/components/cost-calculator'

export default async function ClientPage({ params }: { params: { client: string } }) {
  const { client } = params

  try {
    const config = (await import(`@/configs/${client}.config`)).default
    const data = (await import(`@/data/${client}.json`)).default

    return (
      <main className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold mb-4">{config.clientName}</h1>
          <CostCalculator config={config} data={data} />
        </div>
      </main>
    )
  } catch (err) {
    console.error("Client page error:", err)
    notFound()
  }
}
