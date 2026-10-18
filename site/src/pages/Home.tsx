import { Hero } from '../sections/Hero'
import { SlotExplainer } from '../sections/SlotExplainer'
import { DeliveryFlow } from '../sections/DeliveryFlow'
import { Bestsellers } from '../sections/Bestsellers'
import { DealOfDay } from '../sections/DealOfDay'
import { PlusCards } from '../sections/PlusCards'
import { Counters, CTABand, FAQ, Reviews } from '../sections/SocialProof'

export default function Home({ ready }: { ready: boolean }) {
  return (
    <>
      <Hero ready={ready} />
      <Bestsellers />
      <SlotExplainer />
      <DeliveryFlow />
      <DealOfDay />
      <Counters />
      <PlusCards />
      <Reviews />
      <FAQ />
      <CTABand />
    </>
  )
}
