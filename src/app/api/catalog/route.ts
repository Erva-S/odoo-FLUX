import { NextRequest, NextResponse } from "next/server";
import {
  getProductsService,
  getPlansService,
  createProductService,
  updateProductService,
  deleteProductService,
} from "@/lib/services/catalog";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");

  if (type === "plans") {
    const plansResult = await getPlansService();
    if (!plansResult.success) {
      return NextResponse.json({ error: plansResult.error }, { status: 500 });
    }
    return NextResponse.json({ data: plansResult.data });
  }

  const productsResult = await getProductsService();
  if (!productsResult.success) {
    return NextResponse.json({ error: productsResult.error }, { status: 500 });
  }

  return NextResponse.json({ data: productsResult.data });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await createProductService(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ data: result.data }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Invalid request";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...data } = body;
    if (!id) {
      return NextResponse.json({ error: "Missing product id" }, { status: 400 });
    }
    const result = await updateProductService(id, data);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ data: result.data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Invalid request";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing product id" }, { status: 400 });
  }

  const result = await deleteProductService(id);
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ success: true, id });
}

