// Final LC4 logo files, copied unmodified from "LC-4-logo files":
//   public/brand/lc4-v1.svg — navy "LC" + rule, for light backgrounds
//   public/brand/lc4-v2.svg — white "LC" + rule, for dark backgrounds
// The source artboard has generous padding, so the outer viewBox crops to the
// artwork bounds (x 105.76–744.9, y 79.84–334.16) to keep sizing tight.

const ARTBOARD = { width: 850.67, height: 414 };
const CROP = "105.76 79.84 639.14 254.32";

export default function Logo({
  onDark = false,
  className,
}: {
  onDark?: boolean;
  className?: string;
}) {
  return (
    <svg viewBox={CROP} className={className} role="img" aria-label="LC4 Cuatro">
      <image
        href={onDark ? "/brand/lc4-v2.svg" : "/brand/lc4-v1.svg"}
        width={ARTBOARD.width}
        height={ARTBOARD.height}
      />
    </svg>
  );
}
