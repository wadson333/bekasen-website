/**
 * check-i18n-keys.js
 * Validates that all 4 locale files (fr, en, ht, es) have identical key structures.
 * Called by the i18n-check PostToolUse hook.
 *
 * Input: stdin JSON with hook context (not used directly)
 * Output: stdout JSON with systemMessage if keys are out of sync
 * Exit code: 0 always (advisory, not blocking)
 */

const fs = require("fs");
const path = require("path");

const LOCALES = ["fr", "en", "ht", "es"];
const MESSAGES_DIR = path.resolve(__dirname, "../../../messages");

function getKeys(obj, prefix = "") {
  const keys = [];
  for (const key of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === "object" && obj[key] !== null && !Array.isArray(obj[key])) {
      keys.push(...getKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys.sort();
}

function main() {
  const localeData = {};
  const missing = [];

  for (const locale of LOCALES) {
    const filePath = path.join(MESSAGES_DIR, `${locale}.json`);
    if (!fs.existsSync(filePath)) {
      missing.push(`${locale}.json not found`);
      continue;
    }
    try {
      const content = fs.readFileSync(filePath, "utf-8");
      localeData[locale] = JSON.parse(content);
    } catch (e) {
      missing.push(`${locale}.json parse error: ${e.message}`);
    }
  }

  if (missing.length > 0) {
    const output = {
      systemMessage: `⚠️ i18n issues: ${missing.join(", ")}`
    };
    process.stdout.write(JSON.stringify(output));
    return;
  }

  // Collect all keys from all locales
  const allKeySets = {};
  for (const locale of LOCALES) {
    allKeySets[locale] = new Set(getKeys(localeData[locale]));
  }

  // Find the union of all keys
  const allKeys = new Set();
  for (const locale of LOCALES) {
    for (const key of allKeySets[locale]) {
      allKeys.add(key);
    }
  }

  // Check which locales are missing which keys
  const problems = [];
  for (const key of allKeys) {
    const missingIn = LOCALES.filter((locale) => !allKeySets[locale].has(key));
    if (missingIn.length > 0) {
      problems.push(`"${key}" missing in: ${missingIn.join(", ")}`);
    }
  }

  if (problems.length > 0) {
    const summary = problems.length <= 5
      ? problems.join("\n  - ")
      : problems.slice(0, 5).join("\n  - ") + `\n  ... and ${problems.length - 5} more`;

    const output = {
      systemMessage: `⚠️ i18n keys out of sync across locales:\n  - ${summary}\n\nPlease update all 4 locale files (fr.json, en.json, ht.json, es.json) to have matching keys.`
    };
    process.stdout.write(JSON.stringify(output));
  }
  // If everything is in sync, output nothing (silent success)
}

main();
