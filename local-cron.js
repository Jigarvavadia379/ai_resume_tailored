const fetch = require('node-fetch'); // <--- Add this at the top!

const ENDPOINT = 'https://ai-resume-tailored.vercel.app/api/process-jobs'; // <--- Updated this

async function callProcessJobs() {
  try {
    const res = await fetch(ENDPOINT);
    if (!res.ok) {
      console.error(`[${new Date().toISOString()}] Error: ${res.status} - ${res.statusText}`);
    } else {
      const data = await res.text();
      console.log(`[${new Date().toISOString()}] Success:`, data.slice(0, 100)); // Show first 100 chars
    }
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Request failed:`, err.message || err);
  }
}

console.log(`Starting local cron... will call ${ENDPOINT} every 5 seconds`);
setInterval(callProcessJobs, 5000);
