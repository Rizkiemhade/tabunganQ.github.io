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

    // Sidebar toggle for mobile / responsive
    try {
      const header = document.querySelector('.topbar');
      if (header) {
        // Left container: insert sidebar toggle before title
        const leftContainer = header.querySelector('div') || header;
        const sidebarToggle = document.createElement('button');
        sidebarToggle.id = 'sidebarToggleBtn';
        sidebarToggle.className = 'btn btn-outline-primary btn-sm me-2 sidebar-toggle';
        sidebarToggle.innerHTML = '<i class="bi bi-list"></i>';
        sidebarToggle.setAttribute('aria-label', 'Toggle menu');

        // Insert as first child in header
        leftContainer.insertBefore(sidebarToggle, leftContainer.firstChild);

        const sidebar = document.querySelector('.sidebar');
        const ensureOverlay = () => {
          let overlay = document.getElementById('sidebarOverlay');
          if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'sidebarOverlay';
            overlay.className = 'sidebar-overlay';
            document.body.appendChild(overlay);
          }
          return overlay;
        };

        let sidebarTransitionTimeout = null;

        const closeSidebar = () => {
          if (!sidebar) return;
          // add closing class to allow JS to wait for transition
          sidebar.classList.remove('open');
          sidebar.classList.add('closing');
          const overlay = document.getElementById('sidebarOverlay');
          if (overlay) overlay.classList.remove('visible');
          const duration = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sidebar-duration')) || 300;
          // ensure we remove closing after transition ends
          clearTimeout(sidebarTransitionTimeout);
          sidebarTransitionTimeout = setTimeout(() => {
            sidebar.classList.remove('closing');
          }, duration + 50);
        };

        const openSidebar = () => {
          if (!sidebar) return;
          // compute duration proportional to width
          const sidebarWidth = sidebar.getBoundingClientRect().width || 260;
          const calc = Math.min(500, Math.max(200, Math.round(sidebarWidth * 1.2)));
          document.documentElement.style.setProperty('--sidebar-duration', `${calc}ms`);
          // ensure overlay uses same duration
          const overlay = ensureOverlay();
          // force reflow to make transition-duration apply
          // eslint-disable-next-line no-unused-expressions
          sidebar.offsetWidth;
          sidebar.classList.add('open');
          sidebar.classList.remove('closing');
          overlay.classList.add('visible');
          // add back button inside sidebar for mobile
          try {
            if (sidebar) {
              let backBtn = sidebar.querySelector('#sidebarBackBtn');
              if (!backBtn) {
                backBtn = document.createElement('button');
                backBtn.id = 'sidebarBackBtn';
                backBtn.className = 'btn btn-light btn-sm sidebar-back-btn';
                backBtn.setAttribute('aria-label', 'Kembali');
                backBtn.innerHTML = '<i class="bi bi-arrow-left"></i>';
                // insert at top of sidebar (after brand if exists)
                const brand = sidebar.querySelector('.sidebar-brand');
                if (brand) {
                  // append inside brand so it's on the right of the title
                  brand.appendChild(backBtn);
                } else {
                  sidebar.insertBefore(backBtn, sidebar.firstChild);
                }
                backBtn.addEventListener('click', (e) => {
                  e.stopPropagation();
                  closeSidebar();
                });
              }
            }
          } catch (err) {
            // ignore
          }
        };

        sidebarToggle.addEventListener('click', (e) => {
          e.stopPropagation();
          if (sidebar && sidebar.classList.contains('open')) {
            closeSidebar();
          } else {
            openSidebar();
          }
        });

        // close when overlay clicked
        document.body.addEventListener('click', (e) => {
          const overlay = document.getElementById('sidebarOverlay');
          if (!overlay) return;
          if (e.target === overlay) closeSidebar();
        });
      }
    } catch (e) {
      // ignore DOM errors
    }

    // mobile mode toggle removed (not used)
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
