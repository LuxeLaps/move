import express from "express";
import cors from "cors";
import { exec } from "child_process";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3001;

// POST /simulate
app.post("/simulate", async (req, res) => {
  const { code, entry, args } = req.body;

  if (!code || !entry) {
    return res.status(400).json({ error: "Missing code or entry function" });
  }

  // Create a temp folder for this run
  const runId = uuidv4();
  const tempDir = path.join(__dirname, "temp", runId);
  fs.mkdirSync(tempDir, { recursive: true });

  // Write Move code to file
  const moveFile = path.join(tempDir, "main.move");
  fs.writeFileSync(moveFile, code);

  // Write Move.toml
  const moveToml = `
[package]
name = "playground"
version = "0.0.1"

[addresses]
playground = "_"

[dependencies]
AptosFramework = { git = "https://github.com/aptos-labs/aptos-core.git", subdir = "aptos-move/aptos-framework", rev = "main" }
AptosStdlib   = { git = "https://github.com/aptos-labs/aptos-core.git", subdir = "aptos-move/stdlib", rev = "main" }
`;
  fs.writeFileSync(path.join(tempDir, "Move.toml"), moveToml);

  // Run aptos move compile + simulate
  const cmd = `cd ${tempDir} && aptos move compile && aptos move run --function-id '0x1::main::${entry}' --args ${args?.map((a: string) => `string:${a}`).join(" ") || ""} --simulate`;

  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ error: stderr || error.message });
    }
    res.json({ output: stdout });
  });
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
