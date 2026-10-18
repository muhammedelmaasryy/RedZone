import { motion } from 'motion/react'

// Text-based wordmarks (no third-party logo files) styled in each brand's colors.
const items = [
  { id: 'vf', node: <span className="font-bold text-[#e60000]">Vodafone<span className="text-white/80"> Cash</span></span> },
  { id: 'instapay', node: <span className="font-bold text-[#a855f7]">Insta<span className="text-white/80">Pay</span></span> },
  { id: 'fawry', node: <span className="font-black text-[#ffd200]">fawry</span> },
  { id: 'visa', node: <span className="font-black tracking-tight text-[#a9bcf0] italic">VISA</span> },
  {
    id: 'mc',
    node: (
      <span className="flex items-center">
        <span className="h-4 w-4 rounded-full bg-[#eb001b]" />
        <span className="-ms-1.5 h-4 w-4 rounded-full bg-[#f79e1b] mix-blend-screen" />
      </span>
    ),
  },
  { id: 'cib', node: <span className="font-black text-[#5ea0ff]">CIB</span> },
  { id: 'meeza', node: <span className="font-bold text-[#22c55e]">meeza</span> },
]

export function PaymentStrip({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`} dir="ltr">
      {items.map((i, idx) => (
        <motion.div
          key={i.id}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: idx * 0.05 }}
          whileHover={{ y: -3 }}
          className="flex h-8 items-center rounded border border-white/10 bg-white/5 px-2.5 font-body text-xs"
        >
          {i.node}
        </motion.div>
      ))}
    </div>
  )
}
