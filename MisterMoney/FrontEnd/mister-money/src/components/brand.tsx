import Image from "next/image";

type LogoProps = {
  className?: string;
  preload?: boolean;
};

export function LogoLockup({
  className = "h-auto w-[150px]",
  preload = false,
}: LogoProps) {
  return (
    <Image
      src="/logo-lockup.png"
      alt="Mister Money"
      width={1386}
      height={697}
      preload={preload}
      loading="eager"
      className={`brand-gold ${className}`}
    />
  );
}

export function LogoMark({ className = "h-8 w-auto" }: Omit<LogoProps, "preload">) {
  return (
    <Image
      src="/logo-mark.png"
      alt=""
      width={419}
      height={243}
      loading="eager"
      className={`brand-gold ${className}`}
    />
  );
}

export function BrandWatermark({ className = "" }: { className?: string }) {
  return (
    <LogoMark
      className={`brand-watermark pointer-events-none absolute -right-4 -top-7 h-28 w-auto opacity-[0.07] ${className}`}
    />
  );
}
