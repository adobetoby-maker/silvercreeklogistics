// Cloudflare Worker — fires every 30 minutes via cron trigger.
// Calls the Silver Creek Logistics dispatch endpoint on Vercel,
// which uses Claude Haiku to generate and send the dispatch report.
export default {
  async scheduled(_event, env, _ctx) {
    const res = await fetch(
      "https://silvercreeklogistics.worker-bee.app/api/cron/dispatch",
      { headers: { Authorization: `Bearer ${env.CRON_SECRET}` } }
    );
    const data = await res.json();
    console.log("dispatch cron:", JSON.stringify(data));
  },
};
