"use client"

import { useEffect, useId, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useOutsideClick } from "@/hooks/use-outside-click"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Info, Trash2, AlertCircle, Lightbulb, Clock } from "lucide-react"

interface ClassificationResult {
  category: string
  confidence: number
  explanation: string
  recyclingTips: string[]
  disposalMethod: string
  environmentalImpact: string
}

interface WasteCard {
  id: string
  image: string
  result: ClassificationResult
  timestamp: Date
  title: string
  description: string
}

interface WasteExpandableCardsProps {
  cards: WasteCard[]
}

const wasteCategories = [
  { name: "Plastic", color: "bg-blue-100 text-blue-800 border-blue-200", icon: "🔵" },
  { name: "Glass", color: "bg-green-100 text-green-800 border-green-200", icon: "🟢" },
  { name: "Metal", color: "bg-gray-100 text-gray-800 border-gray-200", icon: "⚪" },
  { name: "Paper", color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: "🟡" },
  { name: "Organic", color: "bg-emerald-100 text-emerald-800 border-emerald-200", icon: "🟢" },
  { name: "E-waste", color: "bg-purple-100 text-purple-800 border-purple-200", icon: "🟣" },
  { name: "Biomedical", color: "bg-red-100 text-red-800 border-red-200", icon: "🔴" },
]

export const CloseIcon = () => {
  return (
    <motion.svg
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.05 } }}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 text-black"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M18 6l-12 12" />
      <path d="M6 6l12 12" />
    </motion.svg>
  )
}

export default function WasteExpandableCards({ cards }: WasteExpandableCardsProps) {
  const [active, setActive] = useState<WasteCard | null>(null)
  const ref = useRef<HTMLDivElement>(null)
  const id = useId()

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActive(null)
      }
    }

    if (active) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [active])

  useOutsideClick(ref, () => setActive(null))

  const getCategoryStyle = (category: string) => {
    const categoryInfo = wasteCategories.find((cat) => cat.name === category)
    return categoryInfo?.color || "bg-gray-100 text-gray-800 border-gray-200"
  }

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      month: "short",
      day: "numeric",
    }).format(date)
  }

  if (cards.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-gray-400" />
        </div>
        <p className="text-gray-500">No classifications yet</p>
        <p className="text-sm text-gray-400 mt-1">Upload an image to get started</p>
      </div>
    )
  }

  return (
    <>
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 h-full w-full z-10"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {active ? (
          <div className="fixed inset-0 grid place-items-center z-[100] p-4">
            <motion.button
              key={`button-${active.id}-${id}`}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.05 } }}
              className="flex absolute top-6 right-6 lg:hidden items-center justify-center bg-white rounded-full h-8 w-8 shadow-lg z-10"
              onClick={() => setActive(null)}
            >
              <CloseIcon />
            </motion.button>

            <motion.div
              layoutId={`card-${active.id}-${id}`}
              ref={ref}
              className="w-full max-w-2xl h-full md:h-fit md:max-h-[90%] flex flex-col bg-white dark:bg-neutral-900 sm:rounded-3xl overflow-hidden shadow-2xl"
            >
              <motion.div layoutId={`image-${active.id}-${id}`}>
                <img
                  src={active.image || "/placeholder.svg"}
                  alt={active.title}
                  className="w-full h-64 lg:h-80 sm:rounded-tr-3xl sm:rounded-tl-3xl object-cover"
                />
              </motion.div>

              <div className="flex-1 overflow-auto">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <motion.h3
                        layoutId={`title-${active.id}-${id}`}
                        className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-2"
                      >
                        {active.result.category} Waste
                      </motion.h3>
                      <motion.p
                        layoutId={`description-${active.id}-${id}`}
                        className="text-neutral-600 dark:text-neutral-400 flex items-center gap-2"
                      >
                        <Clock className="h-4 w-4" />
                        {formatTime(active.timestamp)}
                      </motion.p>
                    </div>

                    <div className="text-right">
                      <Badge
                        variant="outline"
                        className={`text-lg px-4 py-2 ${getCategoryStyle(active.result.category)}`}
                      >
                        {active.result.confidence}% confident
                      </Badge>
                    </div>
                  </div>

                  <Progress value={active.result.confidence} className="h-2 mb-6" />

                  <motion.div
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    {/* Explanation */}
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2 text-neutral-800 dark:text-neutral-200">
                        <Info className="h-5 w-5 text-blue-500" />
                        Analysis Explanation
                      </h4>
                      <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                        {active.result.explanation}
                      </p>
                    </div>

                    {/* Disposal Method */}
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2 text-neutral-800 dark:text-neutral-200">
                        <Trash2 className="h-5 w-5 text-green-500" />
                        Disposal Method
                      </h4>
                      <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                        {active.result.disposalMethod}
                      </p>
                    </div>

                    {/* Recycling Tips */}
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2 text-neutral-800 dark:text-neutral-200">
                        <Lightbulb className="h-5 w-5 text-yellow-500" />
                        Recycling Tips
                      </h4>
                      <ul className="space-y-3">
                        {active.result.recyclingTips.map((tip, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-xs font-medium text-green-600">{index + 1}</span>
                            </div>
                            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">{tip}</p>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Environmental Impact */}
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2 text-neutral-800 dark:text-neutral-200">
                        <AlertCircle className="h-5 w-5 text-orange-500" />
                        Environmental Impact
                      </h4>
                      <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                        {active.result.environmentalImpact}
                      </p>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>

      <div className="space-y-4">
        {cards.map((card) => (
          <motion.div
            layoutId={`card-${card.id}-${id}`}
            key={`card-${card.id}-${id}`}
            onClick={() => setActive(card)}
            className="p-4 flex flex-col md:flex-row justify-between items-center hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-xl cursor-pointer border border-neutral-200 dark:border-neutral-700 transition-colors"
          >
            <div className="flex gap-4 flex-col md:flex-row w-full md:w-auto">
              <motion.div layoutId={`image-${card.id}-${id}`}>
                <img
                  src={card.image || "/placeholder.svg"}
                  alt={card.title}
                  className="h-20 w-20 md:h-16 md:w-16 rounded-lg object-cover mx-auto md:mx-0"
                />
              </motion.div>
              <div className="text-center md:text-left">
                <motion.h3
                  layoutId={`title-${card.id}-${id}`}
                  className="font-medium text-neutral-800 dark:text-neutral-200 mb-1"
                >
                  {card.result.category} Waste
                </motion.h3>
                <motion.p
                  layoutId={`description-${card.id}-${id}`}
                  className="text-sm text-neutral-600 dark:text-neutral-400 flex items-center justify-center md:justify-start gap-1"
                >
                  <Clock className="h-3 w-3" />
                  {formatTime(card.timestamp)}
                </motion.p>
                <Badge variant="outline" className={`text-xs mt-2 ${getCategoryStyle(card.result.category)}`}>
                  {card.result.confidence}% confidence
                </Badge>
              </div>
            </div>
            <motion.button
              layoutId={`button-${card.id}-${id}`}
              className="px-4 py-2 text-sm rounded-full font-medium bg-gray-100 hover:bg-green-500 hover:text-white text-black mt-4 md:mt-0 transition-colors"
            >
              View Details
            </motion.button>
          </motion.div>
        ))}
      </div>
    </>
  )
}
