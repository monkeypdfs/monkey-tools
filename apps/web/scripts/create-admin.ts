import { auth } from "../lib/auth";

async function main() {
  const [email, password, name] = process.argv.slice(2);

  if (!email || !password) {
    console.error("Usage: npx tsx apps/web/scripts/create-admin.ts <email> <password> [name]");
    process.exit(1);
  }

  console.log(`Creating admin user...`);
  console.log(`Email: ${email}`);
  console.log(`Name: ${name || "Admin"}`);

  try {
    // The signUpEmail function usually returns a response object or the data depending on config.
    // We try to call it. Note that without a request context, some hooks might behave differently,
    // but the core creation should work if the database connection is successful.
    const result = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name: name || "Admin",
      },
    });

    console.log("✅ Admin created successfully!");
    console.log(result);
  } catch (error) {
    console.error("❌ Failed to create admin:", error);
    if (error && typeof error === "object" && "body" in error) {
      // biome-ignore lint/suspicious/noExplicitAny: <No exact type available>
      console.error("Error Body:", (error as any).body);
    }
  }

  process.exit(0);
}

main();
