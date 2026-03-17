import { useState, useEffect, useRef } from 'react'
import type { StatsRibbonProps } from '../types'
import { Card } from './ui/card'

function parseValue(str: string) {
  const match = str.match(/^([0-9.,\s]+)(.*)$/)
  if (!match) return { num: 0, suffix: '', decimals: 0 }
  const numStr = match[1].replace(/[^0-9.]/g, '')
  const suffix = match[2].trim()
  const num = parseFloat(numStr) || 0
  const decimals = numStr.includes('.') ? numStr.split('.')[1].length : 0
  return { num, suffix, decimals }
}

function formatValue(current: number, suffix: string, decimals: number) {
  const formatted = decimals > 0 ? current.toFixed(decimals) : Math.round(current).toLocaleString()
  return suffix ? `${formatted} ${suffix}` : formatted
}

function easeOutExpo(t: number) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
}

function AnimatedValue({ value }: { value: string }) {
  const [display, setDisplay] = useState('0')
  const ref = useRef<HTMLSpanElement>(null)
  const animated = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const { num, suffix, decimals } = parseValue(value)
    if (num === 0) return
    animated.current = false

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animated.current) {
          animated.current = true
          const duration = 2000
          const start = performance.now()
          function tick(now: number) {
            const elapsed = now - start
            const progress = Math.min(elapsed / duration, 1)
            const current = easeOutExpo(progress) * num
            setDisplay(formatValue(current, suffix, decimals))
            if (progress < 1) requestAnimationFrame(tick)
          }
          requestAnimationFrame(tick)
        }
      },
      { threshold: 0.3 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [value])

  return (
    <span ref={ref} className="text-3xl font-bold tabular-nums">
      {display}
    </span>
  )
}

export default function StatsRibbon({ stats = [] }: StatsRibbonProps) {
  if (stats.length === 0) return null

  return (
    <div className="flex flex-wrap justify-center gap-4">
      {stats.map((stat, i) => (
        <Card key={i} className="flex flex-col items-center justify-center p-6 text-center min-w-[160px] flex-1">
          <AnimatedValue value={stat.value} />
          <span className="text-sm text-muted-foreground mt-2">{stat.label}</span>
        </Card>
      ))}
    </div>
  )
}
