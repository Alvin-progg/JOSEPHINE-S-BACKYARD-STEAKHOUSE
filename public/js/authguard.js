document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const isAdmin = localStorage.getItem("isAdmin");
  if (!token || isAdmin === "false") {
    window.location.href = "/views/auth/login.html";
  }
  // for admin
  if (isAdmin === "true") {
    window.location.href = "/views/admin/dashboard.html";
  }
});
