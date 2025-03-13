import { sql } from "drizzle-orm";
import { db } from "./drizzle";
import { role } from "./schema";
import { v4 as uuidv4 } from "uuid";

async function seedRoles() {
  console.log("Seeding roles...");

  const defaultRoles = [
    {
      id: uuidv4(),
      name: "admin",
      description: "Administrator with full access",
      permissions: JSON.stringify({
        users: ["create", "read", "update", "delete"],
        roles: ["create", "read", "update", "delete"],
        settings: ["create", "read", "update", "delete"],
      }),
    },
    {
      id: uuidv4(),
      name: "user",
      description: "Regular user with limited access",
      permissions: JSON.stringify({
        users: ["read"],
        profile: ["read", "update"],
      }),
    },
    {
      id: uuidv4(),
      name: "moderator",
      description: "Moderator with management permissions",
      permissions: JSON.stringify({
        users: ["read"],
        content: ["create", "read", "update", "delete"],
      }),
    },
  ];

  try {
    // Insert roles one by one to handle conflicts
    for (const roleData of defaultRoles) {
      await db
        .insert(role)
        .values(roleData)
        .onConflictDoUpdate({
          target: role.name,
          set: {
            description: roleData.description,
            permissions: roleData.permissions,
            updatedAt: new Date(),
          },
        });
      console.log(`Role "${roleData.name}" seeded successfully`);
    }

    console.log("Role seeding completed!");
  } catch (error) {
    console.error("Error seeding roles:", error);
  }
}

async function main() {
  try {
    await seedRoles();
    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error during database seeding:", error);
  } finally {
    process.exit(0);
  }
}

main();
