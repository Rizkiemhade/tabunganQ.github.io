const STORAGE_KEYS = {
  users: 'tabunganq_users',
  nasabah: 'tabunganq_nasabah',
  transaksi: 'tabunganq_transaksi',
  session: 'tabunganq_session'
};

const DEFAULT_USER = {
  id: 'user-1',
  username: 'admin',
  password: 'admin123',
  name: 'Administrator'
};

window.StorageHelper = {
  initDefaults() {
    if (!localStorage.getItem(STORAGE_KEYS.users)) {
      localStorage.setItem(STORAGE_KEYS.users, JSON.stringify([DEFAULT_USER]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.nasabah)) {
      localStorage.setItem(STORAGE_KEYS.nasabah, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.transaksi)) {
      localStorage.setItem(STORAGE_KEYS.transaksi, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.theme)) {
      localStorage.setItem(STORAGE_KEYS.theme, 'light');
    }
  },

  getUsers() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.users) || '[]');
  },

  saveUsers(users) {
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
  },

  getNasabah() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.nasabah) || '[]');
  },

  saveNasabah(data) {
    localStorage.setItem(STORAGE_KEYS.nasabah, JSON.stringify(data));
  },

  getTransactions() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.transaksi) || '[]');
  },

  saveTransactions(data) {
    localStorage.setItem(STORAGE_KEYS.transaksi, JSON.stringify(data));
  },

  getSession() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.session) || 'null');
  },

  setSession(user) {
    localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(user));
  },

  clearSession() {
    localStorage.removeItem(STORAGE_KEYS.session);
  },

  backupData() {
    return {
      users: this.getUsers(),
      nasabah: this.getNasabah(),
      transaksi: this.getTransactions()
    };
  },

  restoreData(backup) {
    if (backup.users && Array.isArray(backup.users)) {
      localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(backup.users));
    }
    if (backup.nasabah && Array.isArray(backup.nasabah)) {
      localStorage.setItem(STORAGE_KEYS.nasabah, JSON.stringify(backup.nasabah));
    }
    if (backup.transaksi && Array.isArray(backup.transaksi)) {
      localStorage.setItem(STORAGE_KEYS.transaksi, JSON.stringify(backup.transaksi));
    }
  }
};
