document.addEventListener('DOMContentLoaded', () => {
  StorageHelper.initDefaults();
  if (!AppHelper.requireLoginPage()) return;

  const loginForm = document.getElementById('loginForm');
  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    const users = StorageHelper.getUsers();
    const user = users.find((item) => item.username === username && item.password === password);

    if (user) {
      StorageHelper.setSession({ id: user.id, username: user.username, name: user.name });
      AppHelper.showAlert('success', 'Berhasil masuk', 'Selamat datang kembali.');
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 500);
    } else {
      AppHelper.showAlert('error', 'Login gagal', 'Username atau password tidak cocok.');
    }
  });
});
