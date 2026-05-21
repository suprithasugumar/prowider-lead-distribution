import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  const client = await clientPromise;
  const db = client.db();

  // Clear old data
  await db.collection("providers").deleteMany({});
  await db.collection("services").deleteMany({});

  // Insert services
  await db.collection("services").insertMany([
    { serviceId: 1, name: "Service 1" },
    { serviceId: 2, name: "Service 2" },
    { serviceId: 3, name: "Service 3" },
  ]);

  // Insert providers
  const providers = [];

  for (let i = 1; i <= 8; i++) {
    providers.push({
      providerId: i,
      name: `Provider ${i}`,
      monthlyQuota: 10,
      quotaUsed: 0,
    });
  }

  await db.collection("providers").insertMany(providers);

  return NextResponse.json({
    success: true,
    message: "Database seeded successfully",
  });
}