import { Navbar } from '../assets/components/Navbar'
import { Hero } from '../assets/components/Hero'
import { Features } from '../assets/components/Features'
import { Footer } from '../assets/components/Footer'

export function Landing() {
    return (
        <div className="min-h-screen bg-slate-950">
            <Navbar />
            <main>
                <Hero />
                <Features />
            </main>
            <Footer />
        </div>
    )
}
