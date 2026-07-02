document.addEventListener('DOMContentLoaded', () => {
  AppHelper.initPage();
  if (!AppHelper.requireAuth()) return;

  const nasabahTableBody = document.querySelector('#nasabahTable tbody');
  const nasabahForm = document.getElementById('nasabahForm');
  const nasabahModal = new bootstrap.Modal(document.getElementById('nasabahModal'));

  const renderNasabah = () => {
    const nasabah = StorageHelper.getNasabah();
    nasabahTableBody.innerHTML = '';
    nasabah.forEach((item, index) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${item.id}</td>
        <td>${item.name}</td>
        <td>${item.gender}</td>
        <td>${item.phone}</td>
        <td>${AppHelper.formatRupiah(item.saldo)}</td>
        <td>${AppHelper.formatDate(item.date)}</td>
        <td>
          <button class="btn btn-sm btn-outline-primary btn-edit" data-id="${item.id}"><i class="bi bi-pencil"></i></button>
          <button class="btn btn-sm btn-outline-danger btn-delete" data-id="${item.id}"><i class="bi bi-trash"></i></button>
        </td>
      `;
      nasabahTableBody.appendChild(tr);
    });
    if ($.fn.DataTable.isDataTable('#nasabahTable')) {
      $('#nasabahTable').DataTable().destroy();
    }
    $('#nasabahTable').DataTable({
      pageLength: 6,
      lengthChange: false,
      order: [[1, 'asc']],
      columnDefs: [{ orderable: false, targets: 6 }]
    });
  };

  const resetForm = () => {
    nasabahForm.reset();
    document.getElementById('nasabahId').value = '';
    nasabahForm.querySelectorAll('.is-invalid').forEach((el) => el.classList.remove('is-invalid'));
    document.getElementById('nasabahBalance').value = 0;
  };

  const openEdit = (id) => {
    const nasabah = StorageHelper.getNasabah();
    const item = nasabah.find((record) => record.id === id);
    if (!item) return;
    document.getElementById('nasabahId').value = item.id;
    document.getElementById('nasabahName').value = item.name;
    document.getElementById('nasabahGender').value = item.gender;
    document.getElementById('nasabahAddress').value = item.address;
    document.getElementById('nasabahPhone').value = item.phone;
    document.getElementById('nasabahBalance').value = item.saldo;
    document.getElementById('nasabahModalLabel').textContent = 'Edit Nasabah';
    nasabahModal.show();
  };

  const deleteNasabah = (id) => {
    Swal.fire({
      title: 'Hapus data?',
      text: 'Data nasabah dan transaksi terkait akan dihapus.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        const nasabah = StorageHelper.getNasabah().filter((item) => item.id !== id);
        const transaksi = StorageHelper.getTransactions().filter((item) => item.nasabahId !== id);
        StorageHelper.saveNasabah(nasabah);
        StorageHelper.saveTransactions(transaksi);
        renderNasabah();
        AppHelper.showAlert('success', 'Berhasil', 'Nasabah berhasil dihapus.');
      }
    });
  };

  nasabahTableBody.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;
    const id = button.dataset.id;
    if (button.classList.contains('btn-edit')) openEdit(id);
    if (button.classList.contains('btn-delete')) deleteNasabah(id);
  });

  nasabahForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const id = document.getElementById('nasabahId').value;
    const name = document.getElementById('nasabahName').value.trim();
    const gender = document.getElementById('nasabahGender').value;
    const address = document.getElementById('nasabahAddress').value.trim();
    const phone = document.getElementById('nasabahPhone').value.trim();
    const saldo = Number(document.getElementById('nasabahBalance').value);

    const formElements = [
      { el: document.getElementById('nasabahName'), valid: name.length > 0 },
      { el: document.getElementById('nasabahGender'), valid: gender.length > 0 },
      { el: document.getElementById('nasabahAddress'), valid: address.length > 0 },
      { el: document.getElementById('nasabahPhone'), valid: /^[0-9]{6,15}$/.test(phone) },
      { el: document.getElementById('nasabahBalance'), valid: saldo >= 0 }
    ];

    let valid = true;
    formElements.forEach((field) => {
      if (!field.valid) {
        field.el.classList.add('is-invalid');
        valid = false;
      } else {
        field.el.classList.remove('is-invalid');
      }
    });
    if (!valid) return;

    const nasabah = StorageHelper.getNasabah();
    if (id) {
      const index = nasabah.findIndex((item) => item.id === id);
      if (index !== -1) {
        nasabah[index] = { ...nasabah[index], name, gender, address, phone, saldo };
      }
      AppHelper.showAlert('success', 'Berhasil', 'Data nasabah diperbarui.');
    } else {
      nasabah.push({
        id: AppHelper.generateId('nasabah'),
        name,
        gender,
        address,
        phone,
        saldo,
        date: new Date().toISOString()
      });
      AppHelper.showAlert('success', 'Berhasil', 'Nasabah baru ditambahkan.');
    }

    StorageHelper.saveNasabah(nasabah);
    renderNasabah();
    nasabahModal.hide();
    resetForm();
  });

  document.getElementById('nasabahModal').addEventListener('hidden.bs.modal', resetForm);

  renderNasabah();
});
