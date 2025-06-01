'use client'

import React, { useState, useEffect } from 'react'

export function CostCalculator({
  config,
  data,
}: {
  config?: any
  data?: any
}) {
  const [input, setInput] = useState(data?.input || { value: 0 })
  const [result, setResult] = useState<number | null>(null)

  useEffect(() => {
    if (config && data) {
      try {
        const calcResult = config.formula(data.input)
        setResult(calcResult)
      } catch (err) {
        console.error('Error calculating result:', err)
      }
    }
  }, [config, data])

  return (
    <div className="bg-gray-50 p-6 rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-4">Interactive Calculator</h2>

      <div className="mb-4">
        <label className="block mb-1 font-medium">Input Value</label>
        <input
          type="number"
          value={input.value}
          onChange={(e) =>
            setInput({ ...input, value: Number(e.target.value) })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded"
        />
      </div>

      <div className="mt-6">
        <h3 className="font-semibold text-lg">Calculated Output</h3>
        <p className="text-xl mt-2 text-green-700">
          {result !== null ? result : 'Waiting for input...'}
        </p>
      </div>
    </div>
  )
}
