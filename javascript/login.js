document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector(".login-box form");
    if (!form) {
        return;
    }

    const auth = JSON.parse(localStorage.getItem("auth"));
    if (auth?.loggedIn) {
        window.location.href = auth.role === "admin" ? "../admin.html" : "../index.html";
        return;
    }

    const users = [
        {
            email: "admin@gmail.com",
            password: "123456",
            role: "admin"
        },
        {
            email: "laceyflender.vn@gmail.com",
            password: "thisislacey2025",
            role: "customer"
        }
    ];

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const emailInput = document.getElementById("email");
        const passwordInput = document.getElementById("password");
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        if (!email || !password) {
            alert("Vui lòng nhập đầy đủ email và mật khẩu");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert("Email không hợp lệ");
            emailInput.focus();
            return;
        }

        const user = users.find(u => u.email === email && u.password === password);
        if (!user) {
            alert("Sai tài khoản hoặc mật khẩu");
            return;
        }

        localStorage.setItem("auth", JSON.stringify({
            email: user.email,
            role: user.role,
            loggedIn: true,
            loginAt: Date.now(),
        }));

        window.location.href = user.role === "admin" ? "../admin.html" : "../index.html";
    });
});