document.addEventListener('DOMContentLoaded', () => {
  AppHelper.initPage();
  if (!AppHelper.requireAuth()) return;

  const nasabahSelect = document.getElementById('transactionNasabah');
  const typeSelect = document.getElementById('transactionType');
  const amountField = document.getElementById('transactionAmount');
  const descriptionField = document.getElementById('transactionDescription');
  const historyTableBody = document.querySelector('#historyTable tbody');
  const transactionForm = document.getElementById('transactionForm');

  const loadNasabahOptions = () => {
    const nasabah = StorageHelper.getNasabah();
    nasabahSelect.innerHTML = '<option value="">Pilih nasabah...</option>';
    nasabah.forEach((item) => {
      const option = document.createElement('option');
      option.value = item.id;
      option.textContent = `${item.name} (${AppHelper.formatRupiah(item.saldo)})`;
      nasabahSelect.appendChild(option);
    });
  };

  const renderHistory = () => {
    const transactions = StorageHelper.getTransactions().slice().reverse();
    historyTableBody.innerHTML = '';
    transactions.forEach((item, index) => {
      const nasabah = StorageHelper.getNasabah().find((n) => n.id === item.nasabahId);
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${index + 1}</td>
        <td>${nasabah ? nasabah.name : 'Tidak ditemukan'}</td>
        <td>${item.type}</td>
        <td>${AppHelper.formatRupiah(item.amount)}</td>
        <td>${AppHelper.formatRupiah(item.balanceAfter)}</td>
        <td>${item.description}</td>
        <td>${AppHelper.formatDate(item.date)}</td>
      `;
      historyTableBody.appendChild(tr);
    });
    if ($.fn.DataTable.isDataTable('#historyTable')) {
      $('#historyTable').DataTable().destroy();
    }
    $('#historyTable').DataTable({
      pageLength: 5,
      lengthChange: false,
      order: [[6, 'desc']],
      columnDefs: [{ orderable: false, targets: [] }]
    });
  };

  const updateNasabahBalance = (id, amount, type) => {
    const nasabah = StorageHelper.getNasabah();
    const index = nasabah.findIndex((item) => item.id === id);
    if (index === -1) return false;
    const current = Number(nasabah[index].saldo);
    if (type === 'Tarik' && amount > current) {
      AppHelper.showAlert('error', 'Gagal', 'Saldo tidak mencukupi.');
      return false;
    }
    nasabah[index].saldo = type === 'Setor' ? current + amount : current - amount;
    StorageHelper.saveNasabah(nasabah);
    return nasabah[index].saldo;
  };

  transactionForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const nasabahId = nasabahSelect.value;
    const type = typeSelect.value;
    const amount = Number(amountField.value);
    const description = descriptionField.value.trim();

    const valid = [
      { el: nasabahSelect, ok: nasabahId.length > 0 },
      { el: typeSelect, ok: type.length > 0 },
      { el: amountField, ok: amount > 0 },
      { el: descriptionField, ok: description.length > 0 }
    ];

    let isValid = true;
    valid.forEach((field) => {
      if (!field.ok) {
        field.el.classList.add('is-invalid');
        isValid = false;
      } else {
        field.el.classList.remove('is-invalid');
      }
    });
    if (!isValid) return;

    const balanceAfter = updateNasabahBalance(nasabahId, amount, type);
    if (balanceAfter === false) return;

    const transactions = StorageHelper.getTransactions();
    transactions.push({
      id: AppHelper.generateId('trx'),
      transactionNumber: AppHelper.generateTransactionNumber(),
      nasabahId,
      type,
      amount,
      balanceAfter,
      description,
      date: new Date().toISOString()
    });
    StorageHelper.saveTransactions(transactions);
    AppHelper.showAlert('success', 'Berhasil', 'Transaksi tersimpan.');
    renderHistory();
    loadNasabahOptions();
    transactionForm.reset();
  });

  loadNasabahOptions();
  renderHistory();
});
