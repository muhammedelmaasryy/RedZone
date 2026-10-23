import { Hero } from '../sections/Hero'
import { Bestsellers, NewReleasesSection, OffersSection } from '../sections/Bestsellers'
import { DeliveryFlow } from '../sections/DeliveryFlow'

export default function Home({ ready }: { ready: boolean }) {
  return (
    <>
      <Hero ready={ready} />
      <OffersSection />
      <NewReleasesSection />
      <Bestsellers />
      <DeliveryFlow />
    </>
  )
}
