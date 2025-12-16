document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector(".login-box");
    if (!form) {
        return;
    }

    const users = [
        {
            email: "admin@gmail.com",
            password: "123456", 
            role: "admin"
        }, 
        {
            email: "laceyflender@gmail.com",
            password: "thisislacey2025",
            role: "customer"
        }
    ];

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        const user = users.find(
            u => u.email === email && u.password === password
        );

        if (!user){
            alert("Sai tài khoản hoặc mật khẩu");
            return;
        }

        localStorage.setItem("auth", JSON.stringify({
            email: user.email,
            role: user.role,
            loggedIn: true
        }));

        if (user.role === "admin"){
            window.location.href = "admin.html";
        } else {
            window.location.href = "index.html";
        }
    });
});