const API = "/api";

// SHOW MESSAGE
function showMessage(message, success = false) {
    const box = document.getElementById("authMessage");

    box.textContent = message;
    box.style.color = success ? "green" : "red";
}

// REGISTER
document.getElementById("registerForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const mobile = document.getElementById("registerMobile").value.trim();
    const password = document.getElementById("registerPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) {
        return showMessage("Passwords do not match.");
    }

    try {
        const response = await fetch(`${API}/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({ mobile, password })
        });

        const data = await response.json();

        if (!response.ok) {
            return showMessage(data.message || "Registration failed.");
        }

        showMessage("Account created successfully. Please login.", true);

        document.getElementById("registerForm").reset();

    } catch (error) {
        showMessage("Server connection failed.");
    }
});


// LOGIN
document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const mobile = document.getElementById("loginMobile").value.trim();
    const password = document.getElementById("loginPassword").value;

    try {
        const response = await fetch(`${API}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({ mobile, password })
        });

        const data = await response.json();

        if (!response.ok) {
            return showMessage(data.message || "Login failed.");
        }

        showMessage("Login successful!", true);

        document.getElementById("loginForm").reset();

        await loadDashboard();

    } catch (error) {
        showMessage("Server connection failed.");
    }
});


// LOAD CUSTOMER DASHBOARD
async function loadDashboard() {
    try {
        const response = await fetch(`${API}/me`, {
            credentials: "include"
        });

        if (!response.ok) {
            return;
        }

        const data = await response.json();

        document.getElementById("dashboardSection").hidden = false;

        document.getElementById("dashboardMobile").textContent =
            "Mobile Number: " + (data.mobile || "");

    } catch (error) {
        console.error("Dashboard error:", error);
    }
}


// LOGOUT
document.getElementById("logoutBtn").addEventListener("click", async () => {
    try {
        const response = await fetch(`${API}/logout`, {
            method: "POST",
            credentials: "include"
        });

        if (response.ok) {
            document.getElementById("dashboardSection").hidden = true;
            showMessage("You have logged out successfully.", true);
        }

    } catch (error) {
        showMessage("Unable to logout.");
    }
});


// CHECK EXISTING LOGIN
document.addEventListener("DOMContentLoaded", () => {
    loadDashboard();
});
