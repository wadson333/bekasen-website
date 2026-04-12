/**
 * block-dangerous-commands.js
 * PreToolUse hook script that blocks dangerous terminal commands.
 *
 * Input: stdin JSON with tool_name and tool_input
 * Output: stdout JSON with permissionDecision if blocked
 * Exit code: 0 = allow, 2 = deny
 */

const BLOCKED_PATTERNS = [
  /rm\s+(-rf|-fr|--recursive)\s+[\/\\]/i,
  /rmdir\s+\/s/i,
  /del\s+\/s\s+\/q/i,
  /DROP\s+(TABLE|DATABASE|SCHEMA)/i,
  /TRUNCATE\s+TABLE/i,
  /git\s+push\s+.*--force(?!-with-lease)/i,
  /git\s+reset\s+--hard/i,
  /--no-verify/i,
  /:(){ :|:& };:/,
  /mkfs\./i,
  /dd\s+if=.*\s+of=\/dev/i,
  /format\s+[a-zA-Z]:/i,
];

function main() {
  let input = "";

  process.stdin.setEncoding("utf-8");
  process.stdin.on("data", (chunk) => {
    input += chunk;
  });

  process.stdin.on("end", () => {
    try {
      const data = JSON.parse(input);
      const toolName = data.tool_name || "";
      const toolInput = data.tool_input || {};

      // Only check terminal/command execution tools
      if (!toolName.match(/terminal|command|shell|exec/i)) {
        process.exit(0);
        return;
      }

      const command = toolInput.command || toolInput.cmd || "";
      if (!command) {
        process.exit(0);
        return;
      }

      for (const pattern of BLOCKED_PATTERNS) {
        if (pattern.test(command)) {
          const output = {
            hookSpecificOutput: {
              permissionDecision: "deny",
              permissionDecisionReason: `Blocked dangerous command matching pattern: ${pattern.source}`
            }
          };
          process.stdout.write(JSON.stringify(output));
          process.exit(2);
          return;
        }
      }

      // Command is safe
      process.exit(0);
    } catch (e) {
      // Parse error — allow by default
      process.exit(0);
    }
  });
}

main();
