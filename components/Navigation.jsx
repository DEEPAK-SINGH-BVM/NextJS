import Link from "next/link";

export default function Navigation() {
  return (
    <header>
      <nav>
        <ul className="flex gap-4 font-roboto">
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <Link href="/about">About</Link>
          </li>
          
          <li>
            <Link href="/clientcomponent">Client Component</Link>
          </li>
          <li>
            <Link href="/servercomponent">Server Component</Link>
          </li>
          <li>
            <Link href="/contact">Contact</Link>
          </li>
          <li>
            <Link href="/service">Service</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
