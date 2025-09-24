import { useState } from "react";
import Editor from "@monaco-editor/react";
import axios from "axios";

function App() {
  const [code, setCode] = useState<string>(`module demo::main {
    public entry fun hello() {
        // your Move code here
    }
}`);
  const [output, setOutput] = useState<string>("");

  const handleRun = async () => {
    try {
      const res = await axios.post("http://localhost:3001/simulate", {
        code,
        entry: "hello",
        args: []
      });
      setOutput(JSON.stringify(res.data, null, 2));
    } catch (err) {
      setOutput("Error running simulation");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 space-y-4">
      <h1 className="text-2xl font-bold">Move Playground 🧠</h1>

      <Editor
        height="400px"
        defaultLanguage="move"
        defaultValue={code}
        theme="vs-dark"
        onChange={(value) => setCode(value || "")}
      />

      <button
        onClick={handleRun}
        className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
      >
        ▶️ Run Simulation
      </button>

      <pre className="bg-gray-800 p-4 rounded overflow-x-auto text-sm">
        {output}
      </pre>
    </div>
  );
}

export default App;
