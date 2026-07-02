window.AppHelper = {
  formatRupiah(value) {
    const number = Number(value) || 0;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(number);
  },

  formatDate(dateString) {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  generateId(prefix = 'item') {
    return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  },

  generateTransactionNumber() {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = Math.floor(100 + Math.random() * 900);
    return `TRX${year}${month}${day}${random}`;
  },

  getCurrentDateTime() {
    const now = new Date();
    return now.toLocaleString('id-ID', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  },

  showAlert(type, title, text) {
    Swal.fire({
      icon: type,
      title,
      text,
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2200,
      timerProgressBar: true
    });
  },

  requireAuth() {
    StorageHelper.initDefaults();
    const session = StorageHelper.getSession();
    if (!session) {
      window.location.href = 'login.html';
      return false;
    }
    return true;
  },

  requireLoginPage() {
    StorageHelper.initDefaults();
    const session = StorageHelper.getSession();
    if (session) {
      window.location.href = 'dashboard.html';
      return false;
    }
    return true;
  },

  initPage() {
    const logout = document.getElementById('logoutBtn');
    if (logout) {
      logout.addEventListener('click', () => {
        StorageHelper.clearSession();
        window.location.href = 'login.html';
      });
    }
  },

  updateClock() {
    const timeElement = document.getElementById('timeDisplay');
    const dateElement = document.getElementById('dateDisplay');
    if (timeElement && dateElement) {
      const now = new Date();
      timeElement.textContent = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      dateElement.textContent = now.toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
    }
  },

  updateDashboardStats() {
    const nasabah = StorageHelper.getNasabah();
    const transaksi = StorageHelper.getTransactions();
    const totalSaldo = nasabah.reduce((sum, item) => sum + Number(item.saldo), 0);
    const totalPemasukan = transaksi.filter((t) => t.type === 'Setor').reduce((sum, item) => sum + Number(item.amount), 0);
    const totalPenarikan = transaksi.filter((t) => t.type === 'Tarik').reduce((sum, item) => sum + Number(item.amount), 0);
    const countNasabah = nasabah.length;
    const countTransaksi = transaksi.length;

    const statMap = [
      { id: 'totalSaldo', value: totalSaldo },
      { id: 'totalPemasukan', value: totalPemasukan },
      { id: 'totalPenarikan', value: totalPenarikan },
      { id: 'countNasabah', value: countNasabah },
      { id: 'countTransaksi', value: countTransaksi }
    ];

    statMap.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) el.textContent = item.id === 'countNasabah' || item.id === 'countTransaksi' ? item.value : this.formatRupiah(item.value);
    });

    const summaryPairs = [
      { id: 'summarySaldo', value: totalSaldo },
      { id: 'summaryPemasukan', value: totalPemasukan },
      { id: 'summaryPenarikan', value: totalPenarikan },
      { id: 'summaryNasabah', value: countNasabah }
    ];
    summaryPairs.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) el.textContent = item.id === 'summaryNasabah' ? item.value : this.formatRupiah(item.value);
    });
  }
};
