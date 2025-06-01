import { notFound } from 'next/navigation'
import { CostCalculator } from '@/components/cost-calculator'

export default async function ClientPage({ params }: { params: { client: string } }) {
  const { client } = params

  try {
    const config = (await import(`@/configs/${client}.config`)).default
    const data = (await import(`@/data/${client}.json`)).default

    return (
      <main className="min-h-screen bg-white">
        <CostCalculator config={config} data={data} />
      </main>
    )
  } catch (err) {
    console.error("Client page error:", err)
    notFound()
  }
}
