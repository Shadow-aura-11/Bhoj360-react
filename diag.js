// diag.js - Headless Chrome CDP Page Inspector for /app
const { spawn } = require('child_process');
const http = require('http');

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const TARGET_URL = "http://localhost:4000/app";
const PORT = 9222;

console.log("Launching Headless Chrome on about:blank...");
const chrome = spawn(CHROME_PATH, [
  "--headless=new",
  `--remote-debugging-port=${PORT}`,
  "--disable-gpu",
  "--no-first-run",
  "about:blank"
]);

chrome.on('error', (err) => {
  console.error("Failed to start chrome:", err);
  process.exit(1);
});

setTimeout(() => {
  console.log("Fetching target list...");
  http.get(`http://localhost:${PORT}/json/list`, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const list = JSON.parse(data);
        const target = list.find(t => t.type === 'page');
        if (!target) {
          console.error("No page target found.");
          chrome.kill();
          process.exit(1);
        }
        
        console.log("Found Page Target:", target.url, target.id);
        const wsUrl = target.webSocketDebuggerUrl;
        const ws = new WebSocket(wsUrl);
        
        ws.onopen = () => {
          console.log("CDP Connected. Enabling domains...");
          ws.send(JSON.stringify({ id: 1, method: "Console.enable" }));
          ws.send(JSON.stringify({ id: 2, method: "Runtime.enable" }));
          ws.send(JSON.stringify({ id: 3, method: "Page.enable" }));
          
          setTimeout(() => {
            console.log(`Navigating to: ${TARGET_URL}`);
            ws.send(JSON.stringify({
              id: 4,
              method: "Page.navigate",
              params: { url: TARGET_URL }
            }));
          }, 500);
        };
        
        ws.onmessage = (event) => {
          const msg = JSON.parse(event.data);
          
          if (msg.method === "Console.messageAdded") {
            const { text, level, url, line } = msg.params.message;
            console.log(`[Browser Console - ${level.toUpperCase()}] ${text} (at ${url}:${line})`);
          } else if (msg.method === "Runtime.exceptionThrown") {
            const { exceptionDetails } = msg.params;
            const text = exceptionDetails.exception?.description || exceptionDetails.text;
            console.error(`[Browser UNCAUGHT EXCEPTION]`, text);
          } else if (msg.id === 10) {
            console.log("\n--- Location & Body ---");
            console.log(msg.result?.result?.value);
            console.log("------------------------\n");
          }
        };
        
        // Wait 6.5 seconds after navigation, then inspect
        setTimeout(() => {
          console.log("Evaluating page details...");
          ws.send(JSON.stringify({
            id: 10,
            method: "Runtime.evaluate",
            params: {
              expression: "`URL: ${document.location.href}\n#root Content:\n${document.getElementById('root') ? document.getElementById('root').innerHTML : 'root not found'}`"
            }
          }));
        }, 6500);

        // Terminate after 8 seconds
        setTimeout(() => {
          ws.close();
          chrome.kill();
          process.exit(0);
        }, 8000);

      } catch (err) {
        console.error("Error:", err);
        chrome.kill();
        process.exit(1);
      }
    });
  }).on('error', (err) => {
    console.error("Connect error:", err.message);
    chrome.kill();
    process.exit(1);
  });
}, 2000);
