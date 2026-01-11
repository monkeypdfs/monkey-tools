import Link from "next/link";
import Image from "next/image";

export const Logo = () => {
  return (
    <Link href="/" className="flex items-center gap-3 cursor-pointer group">
      <div className="rounded-lg flex items-center justify-center relative w-14 h-14 transition-transform group-hover:scale-110">
        <Image src="/logo.svg" alt="Monkey Logo" fill sizes="56px" className="object-contain" />
      </div>
      <div className="flex flex-col">
        <span className="text-3xl font-extrabold leading-none tracking-tight text-primary font-[family-name:var(--font-fredoka)]">
          Monkey
        </span>
      </div>
    </Link>
  );
};
