const fs = require("node:fs");
const path = require("node:path");

const generatedDir = path.join(__dirname, "src/generated/client");
const prismaDir = path.join(__dirname, "../../node_modules/.prisma/client");

// Ensure generated directory exists
if (!fs.existsSync(generatedDir)) {
  fs.mkdirSync(generatedDir, { recursive: true });
}

// Copy engine binaries
if (fs.existsSync(prismaDir)) {
  fs.readdirSync(prismaDir).forEach((file) => {
    if (file.includes("libquery_engine")) {
      fs.copyFileSync(path.join(prismaDir, file), path.join(generatedDir, file));
      console.log(`✓ Copied ${file}`);
    }
  });
} else {
  console.log("Prisma cache dir not found, skipping copy.");
}
