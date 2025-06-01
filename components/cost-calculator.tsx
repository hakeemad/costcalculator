"use client"

import React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { InfoIcon as InfoCircle, Calculator, TrendingUp, Download, Printer } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"

export function CostCalculator() {
  // Hospital information
  const [hospitalName, setHospitalName] = useState("")
  const [hospitalSize, setHospitalSize] = useState("")
  const [annualSurgeries, setAnnualSurgeries] = useState(5000)

  // Never events data
  const [neverEvents, setNeverEvents] = useState(5)
  const [avgLegalCost, setAvgLegalCost] = useState(250000)
  const [avgReoperationCost, setAvgReoperationCost] = useState(15000)
  const [avgStaffCost, setAvgStaffCost] = useState(20000)
  const [avgRegulatoryCost, setAvgRegulatoryCost] = useState(10000)

  // Additional costs
  const [reputationCost, setReputationCost] = useState(50000)
  const [patientCompensation, setPatientCompensation] = useState(100000)
  const [includeReputation, setIncludeReputation] = useState(false)
  const [includePatientComp, setIncludePatientComp] = useState(false)

  // iCount pricing - tiered structure
  const [pricingTiers, setPricingTiers] = useState([
    { volume: 50, price: 15 },
    { volume: 50, price: 9.99 },
  ])

  // iCount implementation
  const [unitsNeeded, setUnitsNeeded] = useState(50)
  const [iCountEffectiveness, setICountEffectiveness] = useState(80)
  const [implementationCost, setImplementationCost] = useState(5000)
  const [trainingCost, setTrainingCost] = useState(3000)

  // State for saved assessments
  const [savedAssessments, setSavedAssessments] = useState<
    {
      name: string
      version: number
      data: {
        hospitalName: string
        hospitalSize: string
        annualSurgeries: number
        neverEvents: number
        avgLegalCost: number
        avgReoperationCost: number
        avgStaffCost: number
        avgRegulatoryCost: number
        reputationCost: number
        patientCompensation: number
        includeReputation: boolean
        includePatientComp: boolean
        pricingTiers: { volume: number; price: number }[]
        unitsNeeded: number
        iCountEffectiveness: number
        implementationCost: number
        trainingCost: number
        hospitalLogo: string | null
      }
    }[]
  >([])
  const [assessmentName, setAssessmentName] = useState("")
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [showLoadDialog, setShowLoadDialog] = useState(false)

  // Add the new state for the hospital logo after the other state declarations
  const [hospitalLogo, setHospitalLogo] = useState<string | null>(null)

  // State for print mode
  const [isPrinting, setIsPrinting] = useState(false)

  // Tab state
  const [activeTab, setActiveTab] = useState("calculator")

  // Refs for PDF generation
  const resultsRef = useRef(null)
  const methodologyRef = useRef(null)
  const assumptionsRef = useRef(null)
  const printRef = useRef(null)

  // Load saved assessments from localStorage on component mount
  React.useEffect(() => {
    try {
      const savedData = localStorage.getItem("icount-saved-assessments")
      if (savedData) {
        setSavedAssessments(JSON.parse(savedData))
      }
    } catch (error) {
      console.error("Error loading from localStorage:", error)
    }
  }, [])

  // Add the new state for the hospital logo after the other state declarations
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setHospitalLogo(result)
      }
      reader.readAsDataURL(file)
    }
  }

  // Add the function to remove the logo
  const removeLogo = () => {
    setHospitalLogo(null)
  }

  // Function to save the current assessment
  const saveAssessment = () => {
    if (!assessmentName.trim()) return

    const assessmentData = {
      hospitalName,
      hospitalSize,
      annualSurgeries,
      neverEvents,
      avgLegalCost,
      avgReoperationCost,
      avgStaffCost,
      avgRegulatoryCost,
      reputationCost,
      patientCompensation,
      includeReputation,
      includePatientComp,
      pricingTiers,
      unitsNeeded,
      iCountEffectiveness,
      implementationCost,
      trainingCost,
      hospitalLogo,
    }

    // Check if an assessment with the same name already exists
    const existingIndex = savedAssessments.findIndex((assessment) => assessment.name === assessmentName)

    if (existingIndex !== -1) {
      // Update existing assessment with new version
      const updatedAssessments = [...savedAssessments]
      updatedAssessments[existingIndex] = {
        name: assessmentName,
        version: updatedAssessments[existingIndex].version + 1,
        data: assessmentData,
      }
      setSavedAssessments(updatedAssessments)

      // Save to localStorage
      try {
        localStorage.setItem("icount-saved-assessments", JSON.stringify(updatedAssessments))
      } catch (error) {
        console.error("Error saving to localStorage:", error)
      }
    } else {
      // Create new assessment with version 1
      const newAssessment = { name: assessmentName, version: 1, data: assessmentData }
      const updatedAssessments = [...savedAssessments, newAssessment]
      setSavedAssessments(updatedAssessments)

      // Save to localStorage
      try {
        localStorage.setItem("icount-saved-assessments", JSON.stringify(updatedAssessments))
      } catch (error) {
        console.error("Error saving to localStorage:", error)
      }
    }

    setAssessmentName("")
    setShowSaveDialog(false)
  }

  // Function to load a saved assessment
  const loadAssessment = (index: number) => {
    const assessment = savedAssessments[index]
    if (!assessment) return

    const { data } = assessment

    setHospitalName(data.hospitalName)
    setHospitalSize(data.hospitalSize)
    setAnnualSurgeries(data.annualSurgeries)
    setNeverEvents(data.neverEvents)
    setAvgLegalCost(data.avgLegalCost)
    setAvgReoperationCost(data.avgReoperationCost)
    setAvgStaffCost(data.avgStaffCost)
    setAvgRegulatoryCost(data.avgRegulatoryCost)
    setReputationCost(data.reputationCost)
    setPatientCompensation(data.patientCompensation)
    setIncludeReputation(data.includeReputation)
    setIncludePatientComp(data.includePatientComp)
    setPricingTiers(data.pricingTiers)
    setUnitsNeeded(data.unitsNeeded)
    setICountEffectiveness(data.iCountEffectiveness)
    setImplementationCost(data.implementationCost)
    setTrainingCost(data.trainingCost)
    setHospitalLogo(data.hospitalLogo)

    setShowLoadDialog(false)
    setActiveTab("calculator")
  }

  // Function to delete a saved assessment
  const deleteAssessment = (index: number) => {
    const updatedAssessments = savedAssessments.filter((_, i) => i !== index)
    setSavedAssessments(updatedAssessments)

    // Update localStorage
    try {
      localStorage.setItem("icount-saved-assessments", JSON.stringify(updatedAssessments))
    } catch (error) {
      console.error("Error updating localStorage:", error)
    }
  }

  // Calculate unit cost based on tiered pricing
  const calculateTieredCost = (totalUnits: number, tiers: typeof pricingTiers) => {
    let remainingUnits = totalUnits
    let totalCost = 0
    let averagePrice = 0

    for (const tier of tiers) {
      if (remainingUnits <= 0) break

      const unitsAtThisTier = Math.min(remainingUnits, tier.volume)
      totalCost += unitsAtThisTier * tier.price
      remainingUnits -= unitsAtThisTier
    }

    // If there are remaining units after all tiers, use the last tier's price
    if (remainingUnits > 0 && tiers.length > 0) {
      const lastTierPrice = tiers[tiers.length - 1].price
      totalCost += remainingUnits * lastTierPrice
    }

    averagePrice = totalUnits > 0 ? totalCost / totalUnits : 0

    return { totalCost, averagePrice }
  }

  const { totalCost: unitsTotalCost, averagePrice: unitPrice } = calculateTieredCost(unitsNeeded, pricingTiers)
  const iCountAnnualCost = unitsTotalCost + implementationCost + trainingCost

  // Calculate total costs
  const baseNeverEventCost = avgLegalCost + avgReoperationCost + avgStaffCost + avgRegulatoryCost
  const additionalCosts = (includeReputation ? reputationCost : 0) + (includePatientComp ? patientCompensation : 0)
  const totalCostPerEvent = baseNeverEventCost + additionalCosts

  // Calculate annual average from 5-year total
  const annualNeverEvents = neverEvents / 5
  const totalNeverEventCost = annualNeverEvents * totalCostPerEvent

  const preventedEvents = annualNeverEvents * (iCountEffectiveness / 100)
  const preventedEvents5Year = preventedEvents * 5

  const preventedCost = preventedEvents * totalCostPerEvent
  const netSavings = preventedCost - iCountAnnualCost
  const roi = (netSavings / iCountAnnualCost) * 100

  // Cost per surgery calculation
  const costPerSurgeryWithout = totalNeverEventCost / annualSurgeries
  const costPerSurgeryWith = (totalNeverEventCost - preventedCost + iCountAnnualCost) / annualSurgeries
  const costPerSurgerySavings = costPerSurgeryWithout - costPerSurgeryWith

  // Function to handle printing
  const handlePrint = () => {
    // Make sure we're on the results tab
    setActiveTab("results")

    // Set printing mode to true
    setIsPrinting(true)

    // Use setTimeout to ensure the state has updated and the print view is rendered
    setTimeout(() => {
      // Trigger the browser print dialog
      window.print()

      // Reset printing mode after a delay to ensure the print dialog has opened
      setTimeout(() => {
        setIsPrinting(false)
      }, 500)
    }, 300)
  }

  // Function to generate and download PDF report
  const generatePDF = async () => {
    try {
      console.log("Starting PDF generation...")

      // Make sure we're on the results tab to ensure the ref is attached
      setActiveTab("results")

      // Small delay to ensure the tab switch has completed
      setTimeout(async () => {
        if (!resultsRef.current) {
          console.error("Results ref is not attached")
          alert("Cannot generate PDF: Results section not found")
          return
        }

        // Create PDF document
        const pdf = new jsPDF("p", "mm", "a4")
        const pageWidth = pdf.internal.pageSize.getWidth()
        let yPosition = 15

        // Add logo and header
        if (hospitalLogo) {
          try {
            pdf.addImage(hospitalLogo, "JPEG", 15, 10, 25, 12)
            pdf.setFontSize(18)
            pdf.text("iCount Cost-Effectiveness Analysis", pageWidth / 2, 15, { align: "center" })
          } catch (error) {
            console.error("Error adding logo to PDF:", error)
            pdf.setFontSize(18)
            pdf.text("iCount Cost-Effectiveness Analysis", pageWidth / 2, 15, { align: "center" })
          }
        } else {
          pdf.setFontSize(18)
          pdf.text("iCount Cost-Effectiveness Analysis", pageWidth / 2, 15, { align: "center" })
        }
        yPosition = 25

        // Add hospital info
        pdf.setFontSize(11)
        pdf.text(`Hospital: ${hospitalName || "Not specified"}`, 20, yPosition)
        yPosition += 5
        pdf.text(`Date: ${new Date().toLocaleDateString()}`, 20, yPosition)
        yPosition += 10

        // Add executive summary
        pdf.setFontSize(14)
        pdf.text("Executive Summary", 20, yPosition)
        yPosition += 6

        pdf.setFontSize(10)
        pdf.text("This analysis evaluates the economic impact of implementing the iCount system at", 20, yPosition)
        yPosition += 4
        pdf.text(
          `${hospitalName || "your hospital"}, based on ${annualSurgeries.toLocaleString()} annual surgeries.`,
          20,
          yPosition,
        )
        yPosition += 8

        // Compact key metrics in a 2x3 grid
        pdf.setFillColor(245, 245, 245)
        pdf.rect(20, yPosition, pageWidth - 40, 35, "F")

        pdf.setFont("helvetica", "bold")
        pdf.setFontSize(11)
        pdf.text("Key Metrics", 25, yPosition + 6)
        pdf.setFont("helvetica", "normal")
        pdf.setFontSize(9)

        // Left column
        pdf.text(`Annual Cost of Never Events: £${totalNeverEventCost.toLocaleString()}`, 25, yPosition + 12)
        pdf.text(`Annual iCount Investment: £${iCountAnnualCost.toLocaleString()}`, 25, yPosition + 18)
        pdf.text(`Net Annual Savings: £${netSavings.toLocaleString()}`, 25, yPosition + 24)

        // Right column
        pdf.text(`ROI: ${Math.round(roi)}%`, pageWidth - 80, yPosition + 12)
        pdf.text(`Cost Per Surgery Reduction: £${Math.round(costPerSurgerySavings)}`, pageWidth - 80, yPosition + 18)
        pdf.text(`Prevented Events: ${Math.round(preventedEvents)}`, pageWidth - 80, yPosition + 24)

        yPosition += 40

        // Conclusion statement
        pdf.setFontSize(10)
        pdf.text(
          "Based on this analysis, implementing the iCount system is projected to deliver significant",
          20,
          yPosition,
        )
        yPosition += 4
        pdf.text("cost savings while improving patient safety through the prevention of never events.", 20, yPosition)
        yPosition += 10

        // Divider
        pdf.setDrawColor(200, 200, 200)
        pdf.line(20, yPosition, pageWidth - 20, yPosition)
        yPosition += 8

        // Detailed Results heading
        pdf.setFontSize(14)
        pdf.text("Detailed Results", 20, yPosition)
        yPosition += 8

        // Compact summary table
        pdf.setFontSize(9)
        pdf.setFillColor(250, 250, 250)
        pdf.rect(20, yPosition, pageWidth - 40, 45, "F")

        // Table headers
        pdf.setFont("helvetica", "bold")
        pdf.text("Cost Category", 25, yPosition + 6)
        pdf.text("Annual Amount", pageWidth / 2 - 10, yPosition + 6)
        pdf.text("5-Year Total", pageWidth - 60, yPosition + 6)

        pdf.setFont("helvetica", "normal")
        // Table rows
        pdf.text("Current Never Event Cost", 25, yPosition + 12)
        pdf.text(`£${totalNeverEventCost.toLocaleString()}`, pageWidth / 2 - 10, yPosition + 12)
        pdf.text(`£${(totalNeverEventCost * 5).toLocaleString()}`, pageWidth - 60, yPosition + 12)

        pdf.text("iCount Annual Investment", 25, yPosition + 18)
        pdf.text(`£${iCountAnnualCost.toLocaleString()}`, pageWidth / 2 - 10, yPosition + 18)
        pdf.text(`£${(iCountAnnualCost * 5).toLocaleString()}`, pageWidth - 60, yPosition + 18)

        pdf.text("Annual Cost Avoidance", 25, yPosition + 24)
        pdf.text(`£${preventedCost.toLocaleString()}`, pageWidth / 2 - 10, yPosition + 24)
        pdf.text(`£${(preventedCost * 5).toLocaleString()}`, pageWidth - 60, yPosition + 24)

        pdf.setFont("helvetica", "bold")
        pdf.text("Net Annual Savings", 25, yPosition + 30)
        pdf.text(`£${netSavings.toLocaleString()}`, pageWidth / 2 - 10, yPosition + 30)
        pdf.text(`£${(netSavings * 5).toLocaleString()}`, pageWidth - 60, yPosition + 30)

        yPosition += 50

        // Implementation summary
        pdf.setFont("helvetica", "normal")
        pdf.setFontSize(10)
        pdf.text(`Implementation: ${unitsNeeded} units at avg £${unitPrice.toFixed(2)} each`, 20, yPosition)
        yPosition += 4
        pdf.text(
          `Effectiveness: ${iCountEffectiveness}% | Prevented events: ${Math.round(preventedEvents5Year)} over 5 years`,
          20,
          yPosition,
        )
        yPosition += 4
        pdf.text(
          `Cost per surgery reduction: £${Math.round(costPerSurgerySavings)} across ${annualSurgeries.toLocaleString()} procedures`,
          20,
          yPosition,
        )
        yPosition += 8

        // Cost per surgery analysis
        pdf.setFontSize(11)
        pdf.text("Cost Per Surgery Analysis", 20, yPosition)
        yPosition += 6

        pdf.setFontSize(9)
        pdf.setFillColor(250, 250, 250)
        pdf.rect(20, yPosition, pageWidth - 40, 20, "F")

        pdf.text("Without iCount:", 25, yPosition + 6)
        pdf.text(`£${Math.round(costPerSurgeryWithout)}`, pageWidth / 2 - 20, yPosition + 6)
        pdf.text("With iCount:", 25, yPosition + 12)
        pdf.text(`£${Math.round(costPerSurgeryWith)}`, pageWidth / 2 - 20, yPosition + 12)

        pdf.setFont("helvetica", "bold")
        pdf.text("Savings per surgery:", 25, yPosition + 18)
        pdf.text(`£${Math.round(costPerSurgerySavings)}`, pageWidth / 2 - 20, yPosition + 18)
        pdf.setFont("helvetica", "normal")

        yPosition += 30

        // Add the cost per surgery calculation explanation
        pdf.setFontSize(9)
        pdf.setFillColor(245, 245, 245)
        pdf.rect(20, yPosition, pageWidth - 40, 30, "F")

        pdf.setFont("helvetica", "bold")
        pdf.text("How Cost Per Surgery Reduction is Calculated:", 25, yPosition + 5)
        pdf.setFont("helvetica", "normal")

        pdf.text(
          "Cost per surgery without iCount = Total annual never event cost ÷ Annual number of surgeries",
          25,
          yPosition + 10,
        )
        pdf.text(
          "Cost per surgery with iCount = (Total never event cost - Prevented costs + iCount cost) ÷ Annual number of surgeries",
          25,
          yPosition + 15,
        )
        pdf.text(
          "Savings per surgery = Cost per surgery without iCount - Cost per surgery with iCount",
          25,
          yPosition + 20,
        )
        pdf.text(
          'This represents the reduction in the "safety overhead" cost allocated to each procedure.',
          25,
          yPosition + 25,
        )

        yPosition += 40

        // Additional benefits
        pdf.setFontSize(11)
        pdf.text("Additional Benefits", 20, yPosition)
        yPosition += 8

        pdf.setFontSize(8)
        const benefits = [
          "• Improved patient safety and outcomes",
          "• Enhanced staff confidence and morale",
          "• Reduced regulatory scrutiny and reporting burden",
          "• Improved hospital reputation and patient trust",
        ]

        benefits.forEach((benefit) => {
          pdf.text(benefit, 25, yPosition)
          yPosition += 4
        })

        yPosition += 15 // Increased spacing before footer

        // Footer
        // Footer
        // pdf.setFontSize(8)
        // pdf.setTextColor(100, 100, 100)
        // pdf.text("Generated by iCount Cost-Effectiveness Calculator", pageWidth / 2, 280, { align: "center" })
        // pdf.text(`Page 1 of 3 | ${new Date().toLocaleDateString()}`, pageWidth / 2, 285, { align: "center" })

        // Add a new page for methodology
        pdf.addPage()
        yPosition = 15

        // Switch to methodology tab
        setActiveTab("methodology")

        // Wait for tab switch to complete
        setTimeout(async () => {
          if (!methodologyRef.current) {
            console.error("Methodology ref is not attached")
          } else {
            // Methodology heading
            pdf.setFontSize(16)
            pdf.text("Methodology", 20, yPosition)
            yPosition += 10

            console.log("Capturing methodology section...")
            // Capture and add Methodology section
            const methodologyCanvas = await html2canvas(methodologyRef.current, {
              scale: 1.5,
              logging: true,
              useCORS: true,
              allowTaint: true,
            })

            console.log("Methodology section captured, adding to PDF...")
            const methodologyImgData = methodologyCanvas.toDataURL("image/png")
            const methodologyImgWidth = pageWidth - 20
            const methodologyImgHeight = (methodologyCanvas.height * methodologyImgWidth) / methodologyCanvas.width

            pdf.addImage(methodologyImgData, "PNG", 10, yPosition, methodologyImgWidth, methodologyImgHeight)

            // Add a new page for assumptions
            pdf.addPage()
            yPosition = 15

            // Switch to assumptions tab
            setActiveTab("assumptions")

            // Wait for tab switch to complete
            setTimeout(async () => {
              if (!assumptionsRef.current) {
                console.error("Assumptions ref is not attached")
              } else {
                // Assumptions heading
                pdf.setFontSize(16)
                pdf.text("Assumptions & Limitations", 20, yPosition)
                yPosition += 10

                console.log("Capturing assumptions section...")
                // Capture and add Assumptions section
                const assumptionsCanvas = await html2canvas(assumptionsRef.current, {
                  scale: 1.5,
                  logging: true,
                  useCORS: true,
                  allowTaint: true,
                })

                console.log("Assumptions section captured, adding to PDF...")
                const assumptionsImgData = assumptionsCanvas.toDataURL("image/png")
                const assumptionsImgWidth = pageWidth - 20
                const assumptionsImgHeight = (assumptionsCanvas.height * assumptionsImgWidth) / assumptionsCanvas.width

                pdf.addImage(assumptionsImgData, "PNG", 10, yPosition, assumptionsImgWidth, assumptionsImgHeight)

                // Save the PDF
                pdf.save(`iCount_Analysis_${hospitalName || "Hospital"}_${new Date().toISOString().slice(0, 10)}.pdf`)
                console.log("PDF generated and saved successfully")

                // Switch back to results tab
                setActiveTab("results")
              }
            }, 300)
          }
        }, 300)
      }, 100)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("There was an error generating the PDF: " + (error.message || "Unknown error"))
    }
  }

  // If in printing mode, render the print-friendly version
  if (isPrinting) {
    return (
      <div ref={printRef} className="print-container">
        <div className="print-header">
          <div className="print-header-content">
            {hospitalLogo && (
              <img src={hospitalLogo || "/placeholder.svg"} alt="Hospital logo" className="print-logo" />
            )}
            <div>
              <h1 className="print-title">iCount Cost-Effectiveness Analysis</h1>
              <p className="print-subtitle">
                {hospitalName ? hospitalName : "Hospital"} | {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        <div className="print-section">
          <h2 className="print-section-title">Executive Summary</h2>
          <p>
            This analysis evaluates the economic impact of implementing the iCount system at{" "}
            {hospitalName || "your hospital"}, based on {annualSurgeries.toLocaleString()} annual surgeries.
          </p>

          <div className="print-metrics">
            <div className="print-metric">
              <span className="print-metric-label">Annual Cost of Never Events</span>
              <span className="print-metric-value">£{totalNeverEventCost.toLocaleString()}</span>
            </div>
            <div className="print-metric">
              <span className="print-metric-label">Annual iCount Investment</span>
              <span className="print-metric-value">£{iCountAnnualCost.toLocaleString()}</span>
            </div>
            <div className="print-metric">
              <span className="print-metric-label">Net Annual Savings</span>
              <span className="print-metric-value">£{netSavings.toLocaleString()}</span>
            </div>
            <div className="print-metric">
              <span className="print-metric-label">Return on Investment</span>
              <span className="print-metric-value">{Math.round(roi)}%</span>
            </div>
            <div className="print-metric">
              <span className="print-metric-label">Cost Per Surgery Reduction</span>
              <span className="print-metric-value">£{costPerSurgerySavings.toFixed(2)}</span>
            </div>
            <div className="print-metric">
              <span className="print-metric-label">Prevented Events</span>
              <span className="print-metric-value">{Math.round(preventedEvents)}</span>
            </div>
          </div>

          <p className="print-conclusion">
            Based on this analysis, implementing the iCount system is projected to deliver significant cost savings
            while improving patient safety through the prevention of never events.
          </p>
        </div>

        <div className="print-section">
          <h2 className="print-section-title">Detailed Cost Analysis</h2>

          <div className="print-table">
            <div className="print-table-row print-table-header">
              <div className="print-table-cell">Cost Category</div>
              <div className="print-table-cell">Amount</div>
              <div className="print-table-cell">Notes</div>
            </div>
            <div className="print-table-row">
              <div className="print-table-cell">Legal Costs per Event</div>
              <div className="print-table-cell">£{avgLegalCost.toLocaleString()}</div>
              <div className="print-table-cell">Litigation and settlements</div>
            </div>
            <div className="print-table-row">
              <div className="print-table-cell">Re-operation Costs per Event</div>
              <div className="print-table-cell">£{avgReoperationCost.toLocaleString()}</div>
              <div className="print-table-cell">Theatre time, extended stay</div>
            </div>
            <div className="print-table-row">
              <div className="print-table-cell">Staff Costs per Event</div>
              <div className="print-table-cell">£{avgStaffCost.toLocaleString()}</div>
              <div className="print-table-cell">Sickness, replacement, investigation</div>
            </div>
            <div className="print-table-row">
              <div className="print-table-cell">Regulatory Costs per Event</div>
              <div className="print-table-cell">£{avgRegulatoryCost.toLocaleString()}</div>
              <div className="print-table-cell">Reporting, compliance</div>
            </div>
            {includeReputation && (
              <div className="print-table-row">
                <div className="print-table-cell">Reputation Damage per Event</div>
                <div className="print-table-cell">£{reputationCost.toLocaleString()}</div>
                <div className="print-table-cell">Patient confidence, referrals</div>
              </div>
            )}
            {includePatientComp && (
              <div className="print-table-row">
                <div className="print-table-cell">Additional Patient Compensation</div>
                <div className="print-table-cell">£{patientCompensation.toLocaleString()}</div>
                <div className="print-table-cell">Beyond legal settlements</div>
              </div>
            )}
            <div className="print-table-row print-table-total">
              <div className="print-table-cell">Total Cost per Event</div>
              <div className="print-table-cell">£{totalCostPerEvent.toLocaleString()}</div>
              <div className="print-table-cell"></div>
            </div>
            <div className="print-table-row print-table-total">
              <div className="print-table-cell">Annual Cost ({Math.round(annualNeverEvents)} events avg)</div>
              <div className="print-table-cell">£{totalNeverEventCost.toLocaleString()}</div>
              <div className="print-table-cell"></div>
            </div>
          </div>
        </div>

        <div className="print-section">
          <h2 className="print-section-title">iCount Implementation</h2>

          <div className="print-table">
            <div className="print-table-row print-table-header">
              <div className="print-table-cell">Item</div>
              <div className="print-table-cell">Amount</div>
              <div className="print-table-cell">Notes</div>
            </div>
            <div className="print-table-row">
              <div className="print-table-cell">Units Required</div>
              <div className="print-table-cell">{unitsNeeded}</div>
              <div className="print-table-cell"></div>
            </div>
            <div className="print-table-row">
              <div className="print-table-cell">Unit Price</div>
              <div className="print-table-cell">£{unitPrice.toFixed(2)} avg</div>
              <div className="print-table-cell">Tiered pricing applied</div>
            </div>
            <div className="print-table-row">
              <div className="print-table-cell">Implementation Cost</div>
              <div className="print-table-cell">£{implementationCost.toLocaleString()}</div>
              <div className="print-table-cell">One-time setup</div>
            </div>
            <div className="print-table-row">
              <div className="print-table-cell">Training Cost</div>
              <div className="print-table-cell">£{trainingCost.toLocaleString()}</div>
              <div className="print-table-cell">Staff training</div>
            </div>
            <div className="print-table-row print-table-total">
              <div className="print-table-cell">Total Annual Cost</div>
              <div className="print-table-cell">£{iCountAnnualCost.toLocaleString()}</div>
              <div className="print-table-cell"></div>
            </div>
          </div>
        </div>

        <div className="print-section">
          <h2 className="print-section-title">Savings Analysis</h2>

          <div className="print-table">
            <div className="print-table-row print-table-header">
              <div className="print-table-cell">Item</div>
              <div className="print-table-cell">Amount</div>
              <div className="print-table-cell">Notes</div>
            </div>
            <div className="print-table-row">
              <div className="print-table-cell">Effectiveness Rate</div>
              <div className="print-table-cell">{iCountEffectiveness}%</div>
              <div className="print-table-cell">Based on clinical studies</div>
            </div>
            <div className="print-table-row">
              <div className="print-table-cell">Prevented Events</div>
              <div className="print-table-cell">{Math.round(preventedEvents)}</div>
              <div className="print-table-cell">Out of {Math.round(annualNeverEvents)} annual events (avg)</div>
            </div>
            <div className="print-table-row">
              <div className="print-table-cell">Cost Avoidance</div>
              <div className="print-table-cell">£{preventedCost.toLocaleString()}</div>
              <div className="print-table-cell">Costs prevented by iCount</div>
            </div>
            <div className="print-table-row">
              <div className="print-table-cell">iCount Annual Cost</div>
              <div className="print-table-cell">£{iCountAnnualCost.toLocaleString()}</div>
              <div className="print-table-cell">Investment required</div>
            </div>
            <div className="print-table-row print-table-total">
              <div className="print-table-cell">Net Annual Savings</div>
              <div className="print-table-cell">£{netSavings.toLocaleString()}</div>
              <div className="print-table-cell"></div>
            </div>
            <div className="print-table-row print-table-total">
              <div className="print-table-cell">Return on Investment</div>
              <div className="print-table-cell">{Math.round(roi)}%</div>
              <div className="print-table-cell"></div>
            </div>
          </div>
        </div>

        <div className="print-section">
          <h2 className="print-section-title">Cost Per Surgery Analysis</h2>

          <div className="print-table">
            <div className="print-table-row print-table-header">
              <div className="print-table-cell">Scenario</div>
              <div className="print-table-cell">Cost Per Surgery</div>
              <div className="print-table-cell">Notes</div>
            </div>
            <div className="print-table-row">
              <div className="print-table-cell">Without iCount</div>
              <div className="print-table-cell">£{Math.round(costPerSurgeryWithout)}</div>
              <div className="print-table-cell">Current safety overhead</div>
            </div>
            <div className="print-table-row">
              <div className="print-table-cell">With iCount</div>
              <div className="print-table-cell">£{Math.round(costPerSurgeryWith)}</div>
              <div className="print-table-cell">Including iCount costs</div>
            </div>
            <div className="print-table-row print-table-total">
              <div className="print-table-cell">Savings Per Surgery</div>
              <div className="print-table-cell">£{Math.round(costPerSurgerySavings)}</div>
              <div className="print-table-cell"></div>
            </div>
          </div>

          <div className="print-section">
            <h3 className="print-section-title">How Cost Per Surgery Reduction is Calculated</h3>
            <p>Cost per surgery without iCount = Total annual never event cost ÷ Annual number of surgeries</p>
            <p>
              Cost per surgery with iCount = (Total never event cost - Prevented costs + iCount cost) ÷ Annual number of
              surgeries
            </p>
            <p>Savings per surgery = Cost per surgery without iCount - Cost per surgery with iCount</p>
            <p>This represents the reduction in the "safety overhead" cost allocated to each procedure.</p>
          </div>
        </div>

        <div className="print-section">
          <h2 className="print-section-title">5-Year Projection</h2>

          <div className="print-table">
            <div className="print-table-row print-table-header">
              <div className="print-table-cell">Item</div>
              <div className="print-table-cell">Amount</div>
              <div className="print-table-cell">Notes</div>
            </div>
            <div className="print-table-row">
              <div className="print-table-cell">5-Year Cost Without iCount</div>
              <div className="print-table-cell">£{(totalNeverEventCost * 5).toLocaleString()}</div>
              <div className="print-table-cell">Current trajectory</div>
            </div>
            <div className="print-table-row">
              <div className="print-table-cell">5-Year Cost With iCount</div>
              <div className="print-table-cell">
                £{((totalNeverEventCost - preventedCost + iCountAnnualCost) * 5).toLocaleString()}
              </div>
              <div className="print-table-cell">Including iCount investment</div>
            </div>
            <div className="print-table-row print-table-total">
              <div className="print-table-cell">5-Year Total Savings</div>
              <div className="print-table-cell">£{(netSavings * 5).toLocaleString()}</div>
              <div className="print-table-cell"></div>
            </div>
          </div>
        </div>

        <div className="print-footer">
          <p>Generated on {new Date().toLocaleDateString()} | iCount Cost-Effectiveness Analysis</p>
          <p>For more information, contact iCount at info@icount.com</p>
        </div>
      </div>
    )
  }

  const unitBasePrice = 12.99
  const unitBulkPrice = 9.99

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-gray-900">Cost-Effectiveness Calculator</h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Calculate the potential savings and return on investment from implementing the iCount system
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="calculator">Calculator</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="methodology">Methodology</TabsTrigger>
          <TabsTrigger value="assumptions">Assumptions & Limitations</TabsTrigger>
        </TabsList>

        <TabsContent value="calculator">
          <Card>
            <CardHeader>
              <CardTitle>Input Your Hospital Data</CardTitle>
              <CardDescription>
                Enter your hospital's specific data or use our pre-filled estimates based on NHS averages.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="hospitalName" className="text-base">
                      Hospital/Trust Name
                    </Label>
                    <Input
                      id="hospitalName"
                      value={hospitalName}
                      onChange={(e) => setHospitalName(e.target.value)}
                      placeholder="Enter hospital name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hospitalSize" className="text-base">
                      Hospital Size/Type
                    </Label>
                    <Input
                      id="hospitalSize"
                      value={hospitalSize}
                      onChange={(e) => setHospitalSize(e.target.value)}
                      placeholder="e.g., Large Teaching Hospital"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hospitalLogo" className="text-base">
                    Hospital Logo (for PDF report)
                  </Label>
                  <div className="flex items-center gap-4">
                    {hospitalLogo ? (
                      <div className="relative w-32 h-16 border rounded-md overflow-hidden">
                        <img
                          src={hospitalLogo || "/placeholder.svg"}
                          alt="Hospital logo"
                          className="w-full h-full object-contain"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute top-0 right-0 h-6 w-6 p-0 rounded-full"
                          onClick={removeLogo}
                        >
                          <span className="sr-only">Remove logo</span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-4 w-4"
                          >
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </Button>
                      </div>
                    ) : (
                      <div className="flex-1">
                        <Input
                          id="hospitalLogo"
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="cursor-pointer"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Upload your hospital logo to include in the PDF report (optional)
                        </p>
                      </div>
                    )}
                    {hospitalLogo && (
                      <Button type="button" variant="outline" size="sm" onClick={removeLogo} className="h-9">
                        Remove Logo
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="annualSurgeries" className="text-base">
                    Annual Number of Surgeries
                  </Label>
                  <Input
                    id="annualSurgeries"
                    type="number"
                    value={annualSurgeries}
                    onChange={(e) => setAnnualSurgeries(Number(e.target.value))}
                  />
                  <p className="text-xs text-gray-500">This helps calculate the cost per surgery</p>
                </div>

                <div>
                  <div className="flex justify-between items-center">
                    <Label htmlFor="neverEvents" className="text-base">
                      Number of Never Events (over 5 years)
                    </Label>
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <InfoCircle className="h-4 w-4" />
                      <span>NHS average: 20-30 over 5 years per trust</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 pt-2">
                    <Slider
                      id="neverEvents"
                      min={0}
                      max={50}
                      step={1}
                      value={[neverEvents]}
                      onValueChange={(value) => setNeverEvents(value[0])}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      value={neverEvents}
                      onChange={(e) => setNeverEvents(Number(e.target.value))}
                      className="w-20"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Total never events over the past 5 years (will be averaged annually for calculations)
                  </p>
                </div>

                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger className="text-base font-medium">
                      Cost Per Never Event (York Health Economic Consortium Data)
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid md:grid-cols-2 gap-6 pt-4">
                        <div className="space-y-2">
                          <Label htmlFor="avgLegalCost" className="text-base">
                            Average Legal Cost per Event (£)
                          </Label>
                          <Input
                            id="avgLegalCost"
                            type="number"
                            value={avgLegalCost}
                            onChange={(e) => setAvgLegalCost(Number(e.target.value))}
                          />
                          <p className="text-xs text-gray-500">
                            York study: £250,000 average per event (litigation, settlements)
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="avgReoperationCost" className="text-base">
                            Re-operation Costs per Event (£)
                          </Label>
                          <Input
                            id="avgReoperationCost"
                            type="number"
                            value={avgReoperationCost}
                            onChange={(e) => setAvgReoperationCost(Number(e.target.value))}
                          />
                          <p className="text-xs text-gray-500">
                            York study: £15,000 average (theatre time, extended stay)
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="avgStaffCost" className="text-base">
                            Staff Costs per Event (£)
                          </Label>
                          <Input
                            id="avgStaffCost"
                            type="number"
                            value={avgStaffCost}
                            onChange={(e) => setAvgStaffCost(Number(e.target.value))}
                          />
                          <p className="text-xs text-gray-500">
                            York study: £20,000 average (sickness, replacement, investigation)
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="avgRegulatoryCost" className="text-base">
                            Regulatory & Organizational Costs (£)
                          </Label>
                          <Input
                            id="avgRegulatoryCost"
                            type="number"
                            value={avgRegulatoryCost}
                            onChange={(e) => setAvgRegulatoryCost(Number(e.target.value))}
                          />
                          <p className="text-xs text-gray-500">York study: £10,000 average (reporting, compliance)</p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-2">
                    <AccordionTrigger className="text-base font-medium">
                      Additional Cost Factors (Optional)
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pt-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="includeReputation"
                            checked={includeReputation}
                            onCheckedChange={(checked) => setIncludeReputation(checked === true)}
                          />
                          <Label htmlFor="includeReputation">Include Reputation Damage Costs</Label>
                        </div>

                        {includeReputation && (
                          <div className="space-y-2 pl-6">
                            <Label htmlFor="reputationCost" className="text-base">
                              Reputation Damage Cost per Event (£)
                            </Label>
                            <Input
                              id="reputationCost"
                              type="number"
                              value={reputationCost}
                              onChange={(e) => setReputationCost(Number(e.target.value))}
                            />
                            <p className="text-xs text-gray-500">
                              Estimated cost of reputational damage (patient confidence, referrals)
                            </p>
                          </div>
                        )}

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="includePatientComp"
                            checked={includePatientComp}
                            onCheckedChange={(checked) => setIncludePatientComp(checked === true)}
                          />
                          <Label htmlFor="includePatientComp">Include Additional Patient Compensation</Label>
                        </div>

                        {includePatientComp && (
                          <div className="space-y-2 pl-6">
                            <Label htmlFor="patientCompensation" className="text-base">
                              Additional Patient Compensation per Event (£)
                            </Label>
                            <Input
                              id="patientCompensation"
                              type="number"
                              value={patientCompensation}
                              onChange={(e) => setPatientCompensation(Number(e.target.value))}
                            />
                            <p className="text-xs text-gray-500">Additional compensation beyond legal settlements</p>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <h3 className="font-medium text-lg mb-4">iCount Implementation</h3>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="unitsNeeded" className="text-base">
                      Number of iCount Units Needed
                    </Label>
                    <Input
                      id="unitsNeeded"
                      type="number"
                      value={unitsNeeded}
                      onChange={(e) => setUnitsNeeded(Number(e.target.value))}
                    />
                  </div>

                  <div className="space-y-4">
                    <Label className="text-base">Pricing Tiers</Label>
                    {pricingTiers.map((tier, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 border rounded-lg">
                        <div className="flex-1">
                          <Label className="text-sm">Volume</Label>
                          <Input
                            type="number"
                            value={tier.volume}
                            onChange={(e) => {
                              const newTiers = [...pricingTiers]
                              newTiers[index].volume = Number(e.target.value)
                              setPricingTiers(newTiers)
                            }}
                            className="mt-1"
                          />
                        </div>
                        <div className="flex-1">
                          <Label className="text-sm">Price per unit (£)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={tier.price}
                            onChange={(e) => {
                              const newTiers = [...pricingTiers]
                              newTiers[index].price = Number(e.target.value)
                              setPricingTiers(newTiers)
                            }}
                            className="mt-1"
                          />
                        </div>
                        {pricingTiers.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newTiers = pricingTiers.filter((_, i) => i !== index)
                              setPricingTiers(newTiers)
                            }}
                            className="mt-6"
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setPricingTiers([...pricingTiers, { volume: 100, price: 8.99 }])
                      }}
                      className="w-full"
                    >
                      Add Pricing Tier
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="iCountEffectiveness" className="text-base">
                        Estimated Effectiveness (%)
                      </Label>
                    </div>
                    <div className="flex items-center gap-4">
                      <Slider
                        id="iCountEffectiveness"
                        min={0}
                        max={100}
                        step={5}
                        value={[iCountEffectiveness]}
                        onValueChange={(value) => setICountEffectiveness(value[0])}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        value={iCountEffectiveness}
                        onChange={(e) => setICountEffectiveness(Number(e.target.value))}
                        className="w-20"
                      />
                    </div>
                    <p className="text-xs text-gray-500">Based on clinical studies and existing implementations</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="implementationCost" className="text-base">
                      Implementation Cost (£)
                    </Label>
                    <Input
                      id="implementationCost"
                      type="number"
                      value={implementationCost}
                      onChange={(e) => setImplementationCost(Number(e.target.value))}
                    />
                    <p className="text-xs text-gray-500">One-time setup costs (integration, installation)</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="trainingCost" className="text-base">
                      Training Cost (£)
                    </Label>
                    <Input
                      id="trainingCost"
                      type="number"
                      value={trainingCost}
                      onChange={(e) => setTrainingCost(Number(e.target.value))}
                    />
                    <p className="text-xs text-gray-500">Staff training and onboarding costs</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-3">
              <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => setActiveTab("results")}>
                <Calculator className="mr-2 h-4 w-4" /> Calculate Savings
              </Button>
              <div className="flex gap-2 w-full">
                <Button variant="outline" className="flex-1" onClick={() => setShowSaveDialog(true)}>
                  Save Assessment
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => setShowLoadDialog(true)}>
                  Load Assessment
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="results">
          <div className="grid md:grid-cols-2 gap-6" ref={resultsRef}>
            <Card>
              <CardHeader>
                <CardTitle>Cost Analysis</CardTitle>
                <CardDescription>Breakdown of costs and potential savings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500">Hospital/Trust</p>
                      <p className="text-xl font-bold text-gray-900">{hospitalName || "Your Hospital"}</p>
                      <p className="text-sm text-gray-500 mt-1">{hospitalSize || "Hospital details not specified"}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">Current Annual Cost of Never Events</p>
                        <p className="text-2xl font-bold text-gray-900">£{totalNeverEventCost.toLocaleString()}</p>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">Annual iCount Investment</p>
                        <p className="text-2xl font-bold text-gray-900">£{iCountAnnualCost.toLocaleString()}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {unitsNeeded} units at avg £{unitPrice.toFixed(2)} each + setup costs
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Potential Cost Avoidance</p>
                    <p className="text-2xl font-bold text-green-700">£{preventedCost.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Based on {Math.round(preventedEvents5Year)} prevented events over 5 years ({iCountEffectiveness}%
                      effectiveness, from {neverEvents} total events over 5 years)
                    </p>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Net Annual Savings</p>
                    <p className="text-2xl font-bold text-green-700">£{netSavings.toLocaleString()}</p>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Return on Investment</p>
                    <p className="text-2xl font-bold text-green-700">{roi.toFixed(0)}%</p>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Cost Per Surgery</p>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div>
                        <p className="text-xs text-gray-500">Without iCount</p>
                        <p className="font-semibold">£{costPerSurgeryWithout.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">With iCount</p>
                        <p className="font-semibold">£{costPerSurgeryWith.toFixed(2)}</p>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-green-700 mt-2">
                      Savings: £{costPerSurgerySavings.toFixed(2)} per surgery
                    </p>
                    <div className="mt-2 text-xs text-gray-600 bg-white p-2 rounded border border-gray-200">
                      <p className="font-medium">How this is calculated:</p>
                      <ul className="list-disc pl-4 mt-1 space-y-1">
                        <li>
                          Cost per surgery without iCount = Total annual never event cost ÷ Annual number of surgeries
                        </li>
                        <li>
                          Cost per surgery with iCount = (Total never event cost - Prevented costs + iCount cost) ÷
                          Annual number of surgeries
                        </li>
                        <li>Savings per surgery = Cost per surgery without iCount - Cost per surgery with iCount</li>
                      </ul>
                      <p className="mt-1">
                        This represents the reduction in the "safety overhead" cost allocated to each procedure.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row gap-3">
                <Button
                  className="w-full"
                  onClick={(e) => {
                    e.preventDefault()
                    console.log("Download button clicked")
                    generatePDF()
                  }}
                >
                  <Download className="mr-2 h-4 w-4" /> Download Detailed Report
                </Button>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={(e) => {
                    e.preventDefault()
                    console.log("Print button clicked")
                    handlePrint()
                  }}
                >
                  <Printer className="mr-2 h-4 w-4" /> Print Results
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>5-Year Projection</CardTitle>
                <CardDescription>Long-term financial impact of iCount implementation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">5-Year Cost Without iCount</p>
                    <p className="text-2xl font-bold text-gray-900">£{(totalNeverEventCost * 5).toLocaleString()}</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">5-Year Cost With iCount</p>
                    <p className="text-2xl font-bold text-gray-900">
                      £{((totalNeverEventCost - preventedCost + iCountAnnualCost) * 5).toLocaleString()}
                    </p>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">5-Year Total Savings</p>
                    <p className="text-2xl font-bold text-green-700">£{(netSavings * 5).toLocaleString()}</p>
                  </div>

                  <div className="mt-6 pt-6 border-t">
                    <h3 className="font-medium mb-2">Additional Benefits</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <div className="rounded-full bg-green-100 p-1 mt-0.5">
                          <TrendingUp className="h-3 w-3 text-green-600" />
                        </div>
                        <span>Improved patient safety and outcomes</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="rounded-full bg-green-100 p-1 mt-0.5">
                          <TrendingUp className="h-3 w-3 text-green-600" />
                        </div>
                        <span>Enhanced staff confidence and morale</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="rounded-full bg-green-100 p-1 mt-0.5">
                          <TrendingUp className="h-3 w-3 text-green-600" />
                        </div>
                        <span>Reduced regulatory scrutiny and reporting burden</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="rounded-full bg-green-100 p-1 mt-0.5">
                          <TrendingUp className="h-3 w-3 text-green-600" />
                        </div>
                        <span>Improved hospital reputation and patient trust</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="methodology">
          <div ref={methodologyRef}>
            <Card>
              <CardHeader>
                <CardTitle>Calculation Methodology</CardTitle>
                <CardDescription>How we calculate the cost-effectiveness of iCount implementation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-medium text-lg mb-2">York Health Economic Consortium Study</h3>
                  <p className="text-gray-600">
                    Our calculator is based on a detailed cost-benefit analysis conducted by the York Health Economic
                    Consortium, an independent, highly reputed organization. Their analysis examined the comprehensive
                    costs associated with never events in NHS hospitals, including:
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-600">
                    <li>Direct litigation and settlement costs</li>
                    <li>Re-operation and extended hospital stay expenses</li>
                    <li>Staff-related costs (sickness, replacement, investigation time)</li>
                    <li>Regulatory compliance and organizational impact costs</li>
                  </ul>
                  <p className="text-gray-600 mt-2">
                    According to NHS England data referenced in the study, nearly £70 million has been spent in the last
                    10 years on legal payouts alone for these preventable incidents. This figure does not include the
                    re-operation costs, staff sickness, regulatory and organizational costs.
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-lg mb-2">How We Derived Our Figures</h3>
                  <p className="text-gray-600 mb-2">
                    The York Health Economic Consortium study provided the following breakdown of costs per never event:
                  </p>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start gap-2">
                      <div className="rounded-full bg-gray-200 p-1 mt-0.5">
                        <InfoCircle className="h-3 w-3 text-gray-600" />
                      </div>
                      <div>
                        <strong>Legal Costs (£250,000):</strong> Derived from analyzing NHS Resolution data on
                        litigation and settlements related to never events over the past decade. The £70 million figure
                        mentioned represents approximately 280 cases over 10 years.
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="rounded-full bg-gray-200 p-1 mt-0.5">
                        <InfoCircle className="h-3 w-3 text-gray-600" />
                      </div>
                      <div>
                        <strong>Re-operation Costs (£15,000):</strong> Calculated based on NHS reference costs for
                        additional surgical procedures, extended hospital stays, and related clinical expenses. This
                        includes average theatre time costs (£1,200/hour) and extended inpatient stays (£400/day).
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="rounded-full bg-gray-200 p-1 mt-0.5">
                        <InfoCircle className="h-3 w-3 text-gray-600" />
                      </div>
                      <div>
                        <strong>Staff Costs (£20,000):</strong> Includes staff sickness (average 15 days per incident),
                        replacement costs, investigation time (average 120 hours per incident), and additional training.
                        Based on average NHS staff costs and time allocation studies.
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="rounded-full bg-gray-200 p-1 mt-0.5">
                        <InfoCircle className="h-3 w-3 text-gray-600" />
                      </div>
                      <div>
                        <strong>Regulatory Costs (£10,000):</strong> Derived from analyzing the costs of mandatory
                        reporting, compliance measures, and organizational impact. Includes time spent on regulatory
                        reporting (average 80 hours per incident) and external review processes.
                      </div>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium text-lg mb-2">Calculation Formulas</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <p>
                      <strong>Total Cost per Never Event:</strong> Legal Costs + Re-operation Costs + Staff Costs +
                      Regulatory Costs + Optional Costs (Reputation Damage + Additional Patient Compensation)
                    </p>
                    <p>
                      <strong>Total Never Event Cost:</strong> Number of Events × Total Cost per Never Event
                    </p>
                    <p>
                      <strong>iCount Annual Cost:</strong> (Unit Price × Number of Units) + Implementation Cost +
                      Training Cost
                    </p>
                    <p>
                      <strong>Unit Price:</strong> Tiered pricing structure -{" "}
                      {pricingTiers
                        .map(
                          (tier, index) =>
                            `${tier.volume} units at £${tier.price} each${index < pricingTiers.length - 1 ? ", " : ""}`,
                        )
                        .join("")}
                    </p>
                    <p>
                      <strong>Prevented Events:</strong> Number of Events × Effectiveness Rate
                    </p>
                    <p>
                      <strong>Cost Avoidance:</strong> Prevented Events × Total Cost per Never Event
                    </p>
                    <p>
                      <strong>Net Savings:</strong> Cost Avoidance - iCount Annual Cost
                    </p>
                    <p>
                      <strong>Return on Investment:</strong> (Net Savings ÷ iCount Annual Cost) × 100%
                    </p>
                    <p>
                      <strong>Cost Per Surgery Without iCount:</strong> Total Never Event Cost ÷ Annual Number of
                      Surgeries
                      <span className="text-xs text-gray-500 block ml-6 mt-1">
                        This represents how much of the never event costs are effectively "built into" each surgery
                        performed
                      </span>
                    </p>
                    <p>
                      <strong>Cost Per Surgery With iCount:</strong> (Total Never Event Cost - Cost Avoidance + iCount
                      Annual Cost) ÷ Annual Number of Surgeries
                      <span className="text-xs text-gray-500 block ml-6 mt-1">
                        This shows the new "built-in" cost per surgery after implementing iCount, accounting for both
                        prevented events and the cost of the system
                      </span>
                    </p>
                    <p>
                      <strong>Cost Per Surgery Savings:</strong> Cost Per Surgery Without iCount - Cost Per Surgery With
                      iCount
                      <span className="text-xs text-gray-500 block ml-6 mt-1">
                        The net reduction in cost allocated to each surgery, which can be used to demonstrate efficiency
                        improvements
                      </span>
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-lg mb-2">Effectiveness Rate</h3>
                  <p className="text-gray-600">
                    The effectiveness rate is based on clinical studies and existing implementations of the iCount
                    system. The default value of 80% represents a conservative estimate based on early adopter
                    hospitals. Your actual results may vary based on implementation quality, staff training, and
                    adherence to protocols.
                  </p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-medium text-lg mb-2">Customization</h3>
                  <p className="text-gray-600">
                    This calculator allows you to input your hospital's specific data for a more accurate assessment. If
                    you don't have exact figures, the pre-filled values represent reasonable estimates based on NHS
                    averages and the York Health Economic Consortium study. For a detailed analysis specific to your
                    trust, please contact our team for a comprehensive consultation.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="assumptions">
          <div ref={assumptionsRef}>
            <Card>
              <CardHeader>
                <CardTitle>Assumptions & Limitations</CardTitle>
                <CardDescription>Important considerations when interpreting the calculator results</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-medium text-lg mb-2">Key Assumptions</h3>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start gap-2">
                      <div className="rounded-full bg-gray-200 p-1 mt-0.5">
                        <InfoCircle className="h-3 w-3 text-gray-600" />
                      </div>
                      <div>
                        <strong>Linear Effectiveness:</strong> The calculator assumes that iCount's effectiveness is
                        linear across all types of never events. In reality, effectiveness may vary by procedure type,
                        department, and implementation quality.
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="rounded-full bg-gray-200 p-1 mt-0.5">
                        <InfoCircle className="h-3 w-3 text-gray-600" />
                      </div>
                      <div>
                        <strong>Consistent Costs:</strong> We assume that the cost per never event remains consistent
                        regardless of the total number of events. In practice, costs may scale non-linearly due to
                        systemic issues or economies of scale in investigation processes.
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="rounded-full bg-gray-200 p-1 mt-0.5">
                        <InfoCircle className="h-3 w-3 text-gray-600" />
                      </div>
                      <div>
                        <strong>Implementation Timeline:</strong> The calculator assumes immediate effectiveness
                        following implementation. In reality, there may be a ramp-up period as staff become familiar
                        with the system.
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="rounded-full bg-gray-200 p-1 mt-0.5">
                        <InfoCircle className="h-3 w-3 text-gray-600" />
                      </div>
                      <div>
                        <strong>Consistent Reporting:</strong> We assume that all never events are reported and
                        accounted for in the baseline data. Underreporting may affect the accuracy of the calculations.
                      </div>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium text-lg mb-2">Limitations</h3>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start gap-2">
                      <div className="rounded-full bg-gray-200 p-1 mt-0.5">
                        <InfoCircle className="h-3 w-3 text-gray-600" />
                      </div>
                      <div>
                        <strong>Data Variability:</strong> The York Health Economic Consortium study represents an
                        average across multiple NHS trusts. Individual hospitals may experience significantly different
                        costs based on their size, location, and patient demographics.
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="rounded-full bg-gray-200 p-1 mt-0.5">
                        <InfoCircle className="h-3 w-3 text-gray-600" />
                      </div>
                      <div>
                        <strong>Intangible Benefits:</strong> The calculator focuses primarily on financial metrics and
                        may not fully capture intangible benefits such as improved staff satisfaction, reduced stress,
                        and enhanced institutional reputation.
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="rounded-full bg-gray-200 p-1 mt-0.5">
                        <InfoCircle className="h-3 w-3 text-gray-600" />
                      </div>
                      <div>
                        <strong>Historical Data:</strong> The calculator uses historical data to predict future costs
                        and savings. Changes in healthcare policy, litigation trends, or NHS funding may affect future
                        costs in ways not captured by the model.
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="rounded-full bg-gray-200 p-1 mt-0.5">
                        <InfoCircle className="h-3 w-3 text-gray-600" />
                      </div>
                      <div>
                        <strong>Implementation Factors:</strong> The effectiveness of iCount depends on proper
                        implementation, staff training, and organizational culture. These factors vary between hospitals
                        and are not fully captured in the model.
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-lg mb-2">iCount Pricing Model</h3>
                  <p className="text-gray-600 mb-3">
                    The calculator uses the following pricing structure for iCount units:
                  </p>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center gap-2">
                      <div className="rounded-full bg-green-100 p-1">
                        <InfoCircle className="h-3 w-3 text-green-600" />
                      </div>
                      <span>
                        <strong>Standard pricing:</strong> £{unitBasePrice} per unit
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="rounded-full bg-green-100 p-1">
                        <InfoCircle className="h-3 w-3 text-green-600" />
                      </div>
                      <span>
                        <strong>Volume discount:</strong> £{unitBulkPrice} per unit for orders of 100+ units
                      </span>
                    </li>
                  </ul>
                  <p className="text-gray-600 mt-3">
                    This tiered pricing model is designed to make iCount more accessible for larger hospitals and trusts
                    that require multiple units across different departments. The calculator automatically applies the
                    appropriate pricing tier based on the number of units entered.
                  </p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-medium text-lg mb-2">Recommended Use</h3>
                  <p className="text-gray-600">
                    This calculator is intended as a starting point for discussions about the potential economic
                    benefits of implementing iCount in your hospital. For the most accurate assessment, we recommend:
                  </p>
                  <ul className="space-y-2 mt-2 text-gray-600">
                    <li className="flex items-start gap-2">
                      <div className="rounded-full bg-green-100 p-1 mt-0.5">
                        <TrendingUp className="h-3 w-3 text-green-600" />
                      </div>
                      <span>Using your hospital's actual never event data where available</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="rounded-full bg-green-100 p-1 mt-0.5">
                        <TrendingUp className="h-3 w-3 text-green-600" />
                      </div>
                      <span>Consulting with financial and clinical teams to validate assumptions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="rounded-full bg-green-100 p-1 mt-0.5">
                        <TrendingUp className="h-3 w-3 text-green-600" />
                      </div>
                      <span>Requesting a detailed consultation with our team for a customized analysis</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Save Assessment</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="assessmentName">Assessment Name</Label>
                <Input
                  id="assessmentName"
                  value={assessmentName}
                  onChange={(e) => setAssessmentName(e.target.value)}
                  placeholder="e.g., Hospital A 2025 Assessment"
                  className="mt-1"
                />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={saveAssessment}
                  disabled={!assessmentName.trim()}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showLoadDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Load Assessment</h2>
            {savedAssessments.length === 0 ? (
              <p className="text-gray-500">No saved assessments found.</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {savedAssessments.map((assessment, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                    <div>
                      <span className="font-medium">{assessment.name}</span>
                      <span className="text-sm text-gray-500 ml-2">v{assessment.version}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => loadAssessment(index)}>
                        Load
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteAssessment(index)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-end mt-4">
              <Button variant="outline" onClick={() => setShowLoadDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
