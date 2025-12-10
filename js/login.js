document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    handleLogin(); // Gọi hàm xử lý chính
  });
});
function handleLogin() {
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const email = emailInput ? emailInput.value.trim() : "";
  const password = passwordInput ? passwordInput.value.trim() : "";
  const VALID_EMAIL = "admin@lotustravel.com";
  const VALID_PASSWORD = "password";

  if (!email || !password) {
    alert("Vui lòng nhập Email và Mật khẩu.");
    return;
  }

  if (email === VALID_EMAIL && password === VALID_PASSWORD) {
    alert("Đăng nhập thành công");
    localStorage.setItem("isLoggedIn", "true");

    window.location.href = "index.html";
  } else {
    alert("Sai email hoặc mật khẩu. Vui lòng thử lại.");
  }
  //   // Kiểm tra Rỗng
  //   if (!email || !password) {
  //     alert("Vui lòng nhập đầy đủ Email và Mật khẩu.");
  //     return;
  //   }

  //   // Kiểm tra định dạng Email đơn giản (tùy chọn)
  //   if (!isValidEmail(email)) {
  //     alert("Email không hợp lệ.");
  //     return;
  //   }

  //   // Nếu dữ liệu hợp lệ, gọi hàm gửi API
  //   sendLoginRequest(email, password);
}
localStorage.removeItem("isLoggedIn");
