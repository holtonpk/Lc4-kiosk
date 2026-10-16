import {revalidateTag} from "next/cache";
import {NextRequest, NextResponse} from "next/server";
import {CARS_TAG} from "@/lib/cars-server";

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-revalidate-secret");
  if (secret !== process.env.NEXT_PUBLIC_ADMIN_PIN) {
    return NextResponse.json({revalidated: false}, {status: 401});
  }
  // Expire now (not "max", which serves the old data once more while it
  // refetches): the next kiosk request waits for fresh cars instead.
  revalidateTag(CARS_TAG, {expire: 0});
  return NextResponse.json({revalidated: true});
}
