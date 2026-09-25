import Image from "next/image";
import Link from "next/link";

export function BrandLogo() {
  return (
    <Link
      href="/"
      className="group flex items-center"
      aria-label="Silva Móveis"
    >
      <Image
        src="/silva-moveis-logo-transparent.png"
        alt="Silva Móveis"
        width={1465}
        height={1074}
        priority
        className="h-12 w-auto object-contain sm:h-14"
      />
    </Link>
  );
}
