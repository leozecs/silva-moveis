import Image from "next/image";
import Link from "next/link";

export function BrandLogo() {
  return (
    <Link
      href="/"
      className="group flex items-center"
      aria-label="Silva Moveis"
    >
      <Image
        src="/silva-moveis-logo.svg"
        alt="Silva Moveis"
        width={92}
        height={76}
        priority
        className="h-14 w-auto rounded-full object-contain drop-shadow-sm transition duration-300 group-hover:scale-[1.03]"
      />
    </Link>
  );
}
