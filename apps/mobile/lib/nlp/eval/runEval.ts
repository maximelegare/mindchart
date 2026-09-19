import { analyzeThought } from "../analyzeThought";
import { EVAL_THOUGHTS } from "./thoughts.eval";

const pad = (value: string, size: number) =>
  value.length > size ? `${value.slice(0, size - 1)}…` : value.padEnd(size);

const run = () => {
  const started = performance.now();
  let labeled = 0;
  let categorized = 0;
  let emptyInputNull = 0;
  const rows = EVAL_THOUGHTS.map((item) => {
    const result = analyzeThought(item.text, {
      language: item.language ?? "auto",
    });
    if (result.semanticLabel) labeled += 1;
    if (result.category) categorized += 1;
    if (item.text.trim().length <= 4 && !result.semanticLabel)
      emptyInputNull += 1;
    return {
      text: item.text,
      label: result.semanticLabel,
      category: result.category,
      confidence: result.confidence,
      language: result.language,
    };
  });
  const elapsed = performance.now() - started;

  const specChecks: Array<{
    text: string;
    expectNull?: boolean;
    expectCategory?: string;
    labelMustInclude?: string[];
    labelMustNotMatch?: RegExp;
  }> = [
    { text: "Hmm.", expectNull: true },
    { text: "ok", expectNull: true },
    {
      text: "I should call Mom this weekend.",
      labelMustInclude: ["mom"],
      expectCategory: "action",
    },
    {
      text: "Should I switch to SQLite?",
      expectCategory: "question",
    },
    {
      text: "I should migrate the database.",
      expectCategory: "action",
    },
    {
      text: "Maybe SQLite is causing the problem.",
      expectCategory: "hypothesis",
    },
    {
      text: "What if we used a graph instead?",
      expectCategory: "idea",
    },
    {
      text: "I've noticed that whenever I'm interrupted while coding, it takes me forever to get back into what I was doing.",
      labelMustNotMatch: /\bve\b/i,
    },
    {
      text: "I keep checking Discord whenever I get stuck while programming.",
      labelMustInclude: ["discord"],
      labelMustNotMatch: /whenever/i,
    },
  ];

  const failures: string[] = [];
  for (const check of specChecks) {
    const row = rows.find((item) => item.text === check.text);
    if (!row) {
      failures.push(`missing eval thought: ${check.text}`);
      continue;
    }
    if (check.expectNull && row.label) {
      failures.push(
        `expected null label for "${check.text}", got "${row.label}"`
      );
    }
    if (check.expectCategory && row.category !== check.expectCategory) {
      failures.push(
        `expected ${check.expectCategory} for "${check.text}", got ${row.category}`
      );
    }
    if (check.labelMustInclude) {
      if (!row.label) {
        failures.push(
          `expected label including ${check.labelMustInclude.join("/")} for "${check.text}"`
        );
      } else {
        const lower = row.label.toLowerCase();
        for (const part of check.labelMustInclude) {
          if (!lower.includes(part)) {
            failures.push(`label "${row.label}" missing "${part}"`);
          }
        }
      }
    }
    if (
      check.labelMustNotMatch &&
      row.label &&
      check.labelMustNotMatch.test(row.label)
    ) {
      failures.push(`label "${row.label}" matched ${check.labelMustNotMatch}`);
    }
  }

  console.log(
    `${pad("LABEL", 28)} ${pad("CATEGORY", 14)} ${pad("CONF", 6)} LANG  THOUGHT`
  );
  console.log("-".repeat(120));
  for (const row of rows) {
    console.log(
      `${pad(row.label ?? "—", 28)} ${pad(row.category ?? "—", 14)} ${pad(
        row.confidence.toFixed(2),
        6
      )} ${row.language.padEnd(4)} ${row.text}`
    );
  }

  const perThought = elapsed / rows.length;
  console.log("\n--- summary ---");
  console.log(`thoughts: ${rows.length}`);
  console.log(
    `labels: ${labeled} (${((labeled / rows.length) * 100).toFixed(1)}%)`
  );
  console.log(
    `categories: ${categorized} (${((categorized / rows.length) * 100).toFixed(1)}%)`
  );
  console.log(`short/null preserved: ${emptyInputNull}`);
  console.log(`total: ${elapsed.toFixed(1)}ms`);
  console.log(`per thought: ${perThought.toFixed(2)}ms`);
  if (failures.length > 0) {
    console.log("\n--- spec check failures ---");
    for (const failure of failures) console.log(`- ${failure}`);
    process.exitCode = 1;
  } else {
    console.log("spec checks: ok");
  }
};

run();
