const http = require('http');

const PORT = process.env.PORT || 3004;
const CRON_SECRET = process.env.CRON_SECRET || 'taskflow_cron_internal_secret_2026';

function triggerReminderCheck() {
  const options = {
    hostname: '127.0.0.1',
    port: PORT,
    path: '/api/cron/reminders',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${CRON_SECRET}`
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      if (res.statusCode === 200) {
        try {
          const parsed = JSON.parse(data);
          if (parsed.sent > 0) {
            console.log(`[TaskFlow Reminder Worker] Sent ${parsed.sent} reminders at ${new Date().toISOString()}`);
          }
        } catch (e) {
          // ignore
        }
      }
    });
  });

  req.on('error', (err) => {
    // Ignore connection errors if app is temporarily restarting
  });

  req.end();
}

console.log('[TaskFlow Reminder Worker] Started, polling every 60 seconds...');
// Run immediately once
triggerReminderCheck();
// Poll every 60 seconds
setInterval(triggerReminderCheck, 60 * 1000);
