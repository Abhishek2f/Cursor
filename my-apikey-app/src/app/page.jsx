import { Hero } from "@/components/hero"
import { Features } from "@/components/features"
import { Pricing } from "@/components/pricing"
import { TryItOut } from "@/components/try-it-out"
import { SiteFooter } from "@/components/site-footer"

export default function Page() {
  return (
    <>
      <main>
        <Hero />
        <Features />
        <TryItOut />
        <Pricing />
      </main>
      <SiteFooter />
    </>
  );
}
