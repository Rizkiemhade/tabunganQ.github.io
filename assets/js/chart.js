document.addEventListener('DOMContentLoaded', () => {
  AppHelper.initPage();
  if (!AppHelper.requireAuth()) return;
  AppHelper.updateClock();
  setInterval(() => AppHelper.updateClock(), 1000);
  AppHelper.updateDashboardStats();

  const chartCanvas = document.getElementById('transactionChart');
  if (!chartCanvas) return;

  const transactions = StorageHelper.getTransactions();
  const labels = [];
  const incomes = [];
  const withdrawals = [];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

  const lastSix = [];
  const now = new Date();
  for (let i = 5; i >= 0; i -= 1) {
    const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`;
    lastSix.push({ label: monthNames[month.getMonth()], key, income: 0, withdraw: 0 });
  }

  transactions.forEach((item) => {
    const date = new Date(item.date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const row = lastSix.find((month) => month.key === key);
    if (!row) return;
    if (item.type === 'Setor') row.income += Number(item.amount);
    if (item.type === 'Tarik') row.withdraw += Number(item.amount);
  });

  lastSix.forEach((row) => {
    labels.push(row.label);
    incomes.push(row.income);
    withdrawals.push(row.withdraw);
  });

  new Chart(chartCanvas, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Pemasukan',
          data: incomes,
          borderColor: '#0d6efd',
          backgroundColor: 'rgba(13,110,253,0.1)',
          fill: true,
          tension: 0.35
        },
        {
          label: 'Penarikan',
          data: withdrawals,
          borderColor: '#dc3545',
          backgroundColor: 'rgba(220,53,69,0.1)',
          fill: true,
          tension: 0.35
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: getComputedStyle(document.documentElement).getPropertyValue('--text').trim() } }
      },
      scales: {
        x: { ticks: { color: getComputedStyle(document.documentElement).getPropertyValue('--text').trim() } },
        y: {
          beginAtZero: true,
          ticks: {
            callback(value) {
              return AppHelper.formatRupiah(value);
            },
            color: getComputedStyle(document.documentElement).getPropertyValue('--text').trim()
          }
        }
      }
    }
  });
});
