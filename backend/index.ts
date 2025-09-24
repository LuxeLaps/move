import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import { exec } from "child_process";
import { promisify } from "util";
const execPromise = promisify(exec);
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3001;

app.post("/simulate", async (req, res) => {
  try {
    const { code, entry, args } = req.body;

    if (!code || !entry) {
      console.error("❌ Missing code or entry function");
      return res.status(400).json({ error: "Missing code or entry function" });
    }

    // Use process.cwd() instead of __dirname
    let tempDir: string | null = null; // Declare tempDir outside try block
    const runId = uuidv4();
    tempDir = path.join(process.cwd(), "temp", runId);
    fs.mkdirSync(tempDir, { recursive: true });

    // Write Move source
    fs.writeFileSync(path.join(tempDir, "main.move"), code);

    // Copy your known-good Move.toml
    const sourceToml = path.join(process.cwd(), "move", "playground", "Move.toml");
    const destToml = path.join(tempDir, "Move.toml");
    fs.copyFileSync(sourceToml, destToml);

    // Build CLI command
    const argString = args?.map((a: string) => `string:${a}`).join(" ") || "";
    const moduleAddr = process.env.MODULE_ADDR || "0x1"; // set your real address in .env
    const cmd = `cd ${tempDir} && aptos move compile && aptos move run --function-id '${moduleAddr}::main::${entry}' --args ${argString} --simulate`;

    console.log("▶️ Running command:", cmd);

    const { stdout, stderr } = await execPromise(cmd);
    console.log("STDOUT:", stdout);
    console.error("STDERR:", stderr);

    if (stderr) {
      console.error("❌ Exec error:", stderr);
      return res.status(500).json({ error: stderr });
    }

    res.json({ output: stdout });
  } catch (err: any) {
    console.error("❌ Unexpected server error:", err);
    res.status(500).json({ error: err.message || "Unknown error" });
  } finally {
    // Clean up temporary directory
    if (tempDir) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend running at http://localhost:${PORT}`);
});
