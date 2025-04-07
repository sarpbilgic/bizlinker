// src/app/page.js
import Container from '@/components/Container'

export default function HomePage() {
  return (
    <Container>
      <section className="mt-10 text-center">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">Welcome to BizLinker</h1>
        <p className="text-gray-700 max-w-xl mx-auto">
          Your all-in-one platform to connect, grow, and discover businesses. Explore services, manage contacts, and more.
        </p>
      </section>
    </Container>
  )
}
