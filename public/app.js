// Handwriting Book Publication
// Customer Registration, Login and Dashboard

function showSection(sectionId) {
    document.querySelectorAll("main .card").forEach(section => {
        section.classList.add("hidden");
    });

    const selectedSection = document.getElementById(sectionId);

    if (selectedSection) {
        selectedSection.classList.remove("hidden");
    }

    showMessage("");
}

// Display messages
function showMessage(message, isError = false) {
    const messageBox = document.getElementById("message");

    messageBox.textContent = message;
    messageBox.style.color = isError ? "#ff5555" : "#d4af37";
}

// Customer Registration
document.getElementById("registerForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const mobile = document.getElementById("registerMobile").value.trim();
    const password = document.getElementById("registerPassword").value;

    try {
        const response = await fetch("/api/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                mobile: mobile,
                password: password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            showMessage(data.message, true);
            return;
        }

        showMessage("Account created successfully!");

        document.getElementById("registerForm").reset();

        await loadDashboard();

    } catch (error) {
        showMessage("Server connection failed. Please try again.", true);
    }
});

// Customer Login
document.getElementById("loginForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const mobile = document.getElementById("loginMobile").value.trim();
    const password = document.getElementById("loginPassword").value;

    try {
        const response = await fetch("/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                mobile: mobile,
                password: password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            showMessage(data.message, true);
            return;
        }

        document.getElementById("loginForm").reset();

        await loadDashboard();

    } catch (error) {
        showMessage("Server connection failed. Please try again.", true);
    }
});

// Load Customer Dashboard
async function loadDashboard() {
    try {
        const response = await fetch("/api/me");

        if (!response.ok) {
            showSection("welcomeSection");
            return;
        }

        const data = await response.json();

        document.getElementById("customerWelcome").textContent =
            "Welcome, " + (data.user.fullName || data.user.mobile);

        showSection("dashboardSection");

    } catch (error) {
        showMessage("Unable to load dashboard.", true);
    }
}

// Customer Logout
async function logout() {
    try {
        const response = await fetch("/api/logout", {
            method: "POST"
        });

        if (response.ok) {
            showSection("welcomeSection");
            showMessage("You have logged out successfully.");
        }

    } catch (error) {
        showMessage("Logout failed. Please try again.", true);
    }
}

// Check existing login when website opens
window.addEventListener("DOMContentLoaded", async function() {
    try {
        const response = await fetch("/api/me");

        if (response.ok) {
            await loadDashboard();
        } else {
            showSection("welcomeSection");
        }

    } catch (error) {
        showSection("welcomeSection");
    }
});
