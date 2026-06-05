import Link from "next/link";

export default function Navigation() {
  return (
    <header className="bg-gray-900 text-white shadow-sm">
      <nav className="max-w-6xl mx-auto px-4 py-3" aria-label="Primary navigation">
        <ul className="flex gap-6 items-center font-roboto">
          <li className="mr-auto">
            <Link href="/" className="text-lg font-semibold hover:text-yellow-300 transition-colors">Home</Link>
          </li>
          <li>
            <Link href="/about" className="hover:text-yellow-300 transition-colors">About</Link>
          </li>
          <li>
            <Link href="/clientcomponent" className="hover:text-yellow-300 transition-colors">Client Component</Link>
          </li>
          <li>
            <Link href="/servercomponent" className="hover:text-yellow-300 transition-colors">Server Component</Link>
          </li>
          <li>
            <Link href="/contact" className="hover:text-yellow-300 transition-colors">Contact</Link>
          </li>
          <li>
            <Link href="/service" className="hover:text-yellow-300 transition-colors">Service</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
