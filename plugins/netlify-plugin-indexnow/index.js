const path = require('node:path');

const {STATE_PATH, runOnSuccess} = require('./core.js');

module.exports = {
  onPreBuild: async ({utils}) => {
    try {
      await utils.cache.restore(STATE_PATH);
    } catch (error) {
      console.warn(
        `IndexNow cache restore failed for ${path.basename(STATE_PATH)}; the deploy will continue: ${error.message}`,
      );
    }
  },
  onSuccess: async (event) => {
    const context = process.env.CONTEXT || event.netlifyConfig?.build?.environment?.CONTEXT;
    if (context !== 'production') {
      console.log(`IndexNow skipped non-production deploy context: ${context || 'unknown'}.`);
      return;
    }
    try {
      await runOnSuccess(event);
    } catch (error) {
      console.error(`IndexNow submission failed; the successful deploy remains valid: ${error.message}`);
    }
  },
};
