document.addEventListener('DOMContentLoaded', () => {
  AppHelper.initPage();
  if (!AppHelper.requireAuth()) return;

  const filterStart = document.getElementById('filterStart');
  const filterEnd = document.getElementById('filterEnd');
  const filterBtn = document.getElementById('filterBtn');
  const printBtn = document.getElementById('printReport');
  const exportExcelBtn = document.getElementById('exportExcel');
  const backupBtn = document.getElementById('backupData');
  const restoreBtn = document.getElementById('restoreData');
  const resetBtn = document.getElementById('resetData');
  const restoreInput = document.getElementById('restoreInput');
  const reportTableBody = document.querySelector('#reportTable tbody');

  const updateReport = () => {
    const transactions = StorageHelper.getTransactions();
    const nasabah = StorageHelper.getNasabah();
    const start = filterStart.value ? new Date(filterStart.value) : null;
    const end = filterEnd.value ? new Date(filterEnd.value) : null;

    const filtered = transactions.filter((item) => {
      const date = new Date(item.date);
      if (start && date < start) return false;
      if (end && date > new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59)) return false;
      return true;
    });

    const totalSaldo = nasabah.reduce((sum, item) => sum + Number(item.saldo), 0);
    const totalPemasukan = filtered.filter((item) => item.type === 'Setor').reduce((sum, item) => sum + Number(item.amount), 0);
    const totalPenarikan = filtered.filter((item) => item.type === 'Tarik').reduce((sum, item) => sum + Number(item.amount), 0);
    const countTransaksi = filtered.length;

    document.getElementById('reportSaldo').textContent = AppHelper.formatRupiah(totalSaldo);
    document.getElementById('reportPemasukan').textContent = AppHelper.formatRupiah(totalPemasukan);
    document.getElementById('reportPenarikan').textContent = AppHelper.formatRupiah(totalPenarikan);
    document.getElementById('reportCount').textContent = countTransaksi;

    reportTableBody.innerHTML = '';
    filtered.slice().reverse().forEach((item, index) => {
      const nasabahItem = nasabah.find((n) => n.id === item.nasabahId);
      const tr = document.createElement('tr');

      const tdNo = document.createElement('td'); tdNo.textContent = index + 1;
      const tdName = document.createElement('td'); tdName.textContent = nasabahItem ? nasabahItem.name : 'Tidak ditemukan';
      const tdType = document.createElement('td'); tdType.textContent = item.type;
      const tdAmount = document.createElement('td'); tdAmount.textContent = AppHelper.formatRupiah(item.amount);
      const tdBalance = document.createElement('td'); tdBalance.textContent = AppHelper.formatRupiah(item.balanceAfter);
      const tdDesc = document.createElement('td'); tdDesc.textContent = item.description;
      const tdDate = document.createElement('td'); tdDate.textContent = AppHelper.formatDate(item.date);

      tr.appendChild(tdNo);
      tr.appendChild(tdName);
      tr.appendChild(tdType);
      tr.appendChild(tdAmount);
      tr.appendChild(tdBalance);
      tr.appendChild(tdDesc);
      tr.appendChild(tdDate);

      reportTableBody.appendChild(tr);
    });
    if ($.fn.DataTable.isDataTable('#reportTable')) {
      $('#reportTable').DataTable().destroy();
    }
    $('#reportTable').DataTable({
      pageLength: 6,
      lengthChange: false,
      order: [[6, 'desc']],
      columnDefs: [{ orderable: false, targets: [] }]
    });
  };

  filterBtn.addEventListener('click', updateReport);
  printBtn.addEventListener('click', () => window.print());
  exportExcelBtn.addEventListener('click', () => {
    const rows = [['No', 'Nasabah', 'Jenis', 'Nominal', 'Saldo Setelah', 'Keterangan', 'Tanggal']];
    document.querySelectorAll('#reportTable tbody tr').forEach((tr) => {
      rows.push(Array.from(tr.children).map((td) => td.textContent.trim()));
    });
    const csvContent = rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'laporan-tabungan.csv');
    link.click();
  });

  backupBtn.addEventListener('click', () => {
    const backup = StorageHelper.backupData();
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'backup-tabunganq.json');
    link.click();
  });

  restoreBtn.addEventListener('click', () => restoreInput.click());
  restoreInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        StorageHelper.restoreData(data);
        AppHelper.showAlert('success', 'Berhasil', 'Data berhasil dipulihkan.');
        updateReport();
      } catch (error) {
        AppHelper.showAlert('error', 'Gagal', 'File JSON tidak valid.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  });

  resetBtn.addEventListener('click', () => {
    Swal.fire({
      title: 'Reset semua data?',
      text: 'Semua data nasabah, transaksi, dan pengguna akan dihapus.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, reset!'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear();
        StorageHelper.initDefaults();
        AppHelper.showAlert('success', 'Berhasil', 'Data telah direset.');
        updateReport();
      }
    });
  });

  updateReport();
});
