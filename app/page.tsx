import { CostCalculator } from "@/components/cost-calculator"
import { HeroSection } from "@/components/hero-section"

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <HeroSection />
      <div className="container mx-auto px-4 py-12">
        <CostCalculator />
      </div>
    </main>
  )
}
