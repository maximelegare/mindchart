module.exports = {
  constraints: async ({ Yarn }) => {
    const ignored = ["tsx"];

    for (const dependency of Yarn.dependencies()) {
      if (ignored.includes(dependency.ident)) continue;
      // 1. Skip internal workspace links
      if (dependency.range.startsWith('workspace:')) continue;

      // 2. Find every OTHER package using this same dependency
      for (const other of Yarn.dependencies({ ident: dependency.ident })) {
        if (other.range.startsWith('workspace:')) continue;

        // 3. If versions don't match exactly, throw an error
        if (dependency.range !== other.range) {
          dependency.workspace.error(
            `Version mismatch for "${dependency.ident}": ${dependency.range} vs ${other.range} (in ${other.workspace.cwd})`
          );
        }
      }
    }
  },
  // This is the hook that triggers AFTER a yarn install finishes
  hooks: {
    afterAllInstalled: async (project) => {
      console.log('✨ Install complete! Checking constraints...');
      // This allows you to run logic immediately after the lockfile is updated
    },
  },
};