import {revalidateTag} from "next/cache";
import {NextRequest, NextResponse} from "next/server";
import {CARS_TAG} from "@/lib/cars-server";

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-revalidate-secret");
  if (secret !== process.env.NEXT_PUBLIC_ADMIN_PIN) {
    return NextResponse.json({revalidated: false}, {status: 401});
  }
  revalidateTag(CARS_TAG, "max");
  return NextResponse.json({revalidated: true});
}
