import Image from "next/image"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <div className="bg-gradient-to-b from-green-50 to-white">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10">
                <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                  {/* Hand with three yellow fingers */}
                  <path
                    d="M25 45 L25 25 Q25 20 30 20 Q35 20 35 25 L35 45"
                    fill="#FCD34D"
                    stroke="#F59E0B"
                    strokeWidth="1"
                  />
                  <path
                    d="M35 45 L35 20 Q35 15 40 15 Q45 15 45 20 L45 45"
                    fill="#FCD34D"
                    stroke="#F59E0B"
                    strokeWidth="1"
                  />
                  <path
                    d="M45 45 L45 25 Q45 20 50 20 Q55 20 55 25 L55 45"
                    fill="#FCD34D"
                    stroke="#F59E0B"
                    strokeWidth="1"
                  />
                  {/* Palm */}
                  <path
                    d="M25 45 Q20 45 20 50 L20 65 Q20 75 30 75 L50 75 Q60 75 60 65 L60 50 Q60 45 55 45 L25 45"
                    fill="#FCD34D"
                    stroke="#F59E0B"
                    strokeWidth="1"
                  />
                  {/* Purple checkmark thumb */}
                  <path
                    d="M15 55 L25 65 L40 40"
                    fill="none"
                    stroke="#7C3AED"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">
                <span style={{ color: "#7C3AED" }}>iCount</span> Cost-Effectiveness Calculator
              </h1>
            </div>
            <p className="text-lg text-gray-700">
              Understand the economic impact of implementing iCount in your hospital. Calculate potential savings by
              reducing never events and their associated costs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="bg-green-600 hover:bg-green-700" size="lg">
                Request Demo
              </Button>
              <Button variant="outline" size="lg">
                Learn More
              </Button>
            </div>
          </div>
          <div className="flex-1 relative h-[300px] w-full rounded-lg overflow-hidden shadow-xl">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/icount-logo-stacked-full-colour-rgb-1200px-w-72ppi-27p2DaK6SO8aq2TWadzpJ40jjvVYcw.png"
              alt="iCount Logo - Maternity and Surgical Safety System"
              fill
              className="object-contain bg-white p-8"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
