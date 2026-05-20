import { usePageMeta } from '../hooks/usePageMeta'
import HeroSlideshow from '../components/store/HeroSlideshow'
import CategoryShowcase from '../components/store/CategoryShowcase'
import Bestsellers from '../components/store/Bestsellers'

export default function Home() {
  usePageMeta({
    title: 'Zenitech — Apple Authorized Reseller',
    description:
      'Belanja resmi iPhone, Mac, iPad, Apple Watch, dan aksesoris Apple di Indonesia. Pembayaran aman, pengiriman ke seluruh Indonesia.',
  })

  return (
    <main style={{ backgroundColor: '#ffffff' }}>
      <HeroSlideshow />

      <Bestsellers
        title="Bestsellers"
        linkLabel="See all products"
        linkTo="/products"
        limit={4}
      />

      <CategoryShowcase />

      <Bestsellers
        title="Featured Products"
        linkLabel="See all products"
        linkTo="/products"
        limit={4}
      />

      <section className="home-footer-strip">
        <div className="home-footer-strip__inner">
          <p>
            Reseller Resmi Apple. Garansi resmi 1 tahun, gratis pengiriman ke seluruh Indonesia.
          </p>
          <p>
            Copyright © 2026 Zenitech Indonesia. Apple, the Apple logo, iPhone, iPad, Mac, Apple Watch, AirPods are trademarks of Apple Inc.
          </p>
        </div>

        <style>{`
          .home-footer-strip {
            background-color: #f5f5f7;
            padding: 32px 24px 64px;
            border-top: 1px solid #d2d2d7;
            margin-top: 24px;
          }
          .home-footer-strip__inner {
            max-width: 1488px;
            margin: 0 auto;
          }
          .home-footer-strip p {
            font-family: 'SF Pro Text', system-ui, -apple-system, sans-serif;
            font-size: 12px;
            color: #6e6e73;
            line-height: 1.5;
            letter-spacing: -0.16px;
            margin-bottom: 8px;
          }
          .home-footer-strip p:last-child { margin-bottom: 0; }
        `}</style>
      </section>
    </main>
  )
}
