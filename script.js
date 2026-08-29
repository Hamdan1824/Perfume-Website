/* ===========================================================
   TR Perfume — shared script
   Used by index.html (nav highlight only) and order.html
   (order form -> WhatsApp click-to-chat handoff).
   =========================================================== */

// ---- Config: edit these two lines to change the number or price ----
const WHATSAPP_NUMBER = "923272932973"; // country code + number, no + or spaces
const UNIT_PRICE = 1799; // Rs.

// ---- Highlight the current page in the nav ----
(function highlightActiveNav() {
  const path = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-link").forEach((link) => {
    const href = link.getAttribute("href");
    if (href === path) link.classList.add("active");
  });
})();

// ---- Order page logic (safe no-op if these elements don't exist) ----
(function orderForm() {
  const form = document.getElementById("order-form");
  if (!form) return; // not on order.html

  const qtyValueEl = document.getElementById("qty-value");
  const qtyInput = document.getElementById("quantity");
  const qtyMinus = document.getElementById("qty-minus");
  const qtyPlus = document.getElementById("qty-plus");
  const summaryQty = document.getElementById("summary-qty");
  const summaryTotal = document.getElementById("summary-total");
  const statusBox = document.getElementById("form-status");
  const submitBtn = document.getElementById("submit-btn");

  function currentQty() {
    return parseInt(qtyInput.value, 10) || 1;
  }

  function formatRs(amount) {
    return "Rs. " + amount.toLocaleString("en-PK");
  }

  function updateSummary() {
    const qty = currentQty();
    qtyValueEl.textContent = qty;
    summaryQty.textContent = qty;
    summaryTotal.textContent = formatRs(qty * UNIT_PRICE);
  }

  qtyMinus.addEventListener("click", () => {
    qtyInput.value = Math.max(1, currentQty() - 1);
    updateSummary();
  });
  qtyPlus.addEventListener("click", () => {
    qtyInput.value = Math.min(20, currentQty() + 1);
    updateSummary();
  });
  qtyInput.addEventListener("input", () => {
    if (currentQty() < 1) qtyInput.value = 1;
    updateSummary();
  });

  updateSummary();

  // ---- Field validation helpers ----
  function setFieldError(fieldId, message) {
    const wrap = document.getElementById(fieldId).closest(".field");
    wrap.classList.add("invalid");
    wrap.querySelector(".error-msg").textContent = message;
  }
  function clearFieldError(fieldId) {
    const wrap = document.getElementById(fieldId).closest(".field");
    wrap.classList.remove("invalid");
  }
  function clearAllErrors() {
    document.querySelectorAll(".field").forEach((f) => f.classList.remove("invalid"));
  }

  function validate(data) {
    clearAllErrors();
    let ok = true;

    if (!data.name.trim()) {
      setFieldError("name", "Please enter your name.");
      ok = false;
    }
    // Basic phone check: at least 10 digits
    const digits = data.phone.replace(/\D/g, "");
    if (digits.length < 10) {
      setFieldError("phone", "Please enter a valid phone number.");
      ok = false;
    }
    if (!data.address.trim()) {
      setFieldError("address", "Please enter your delivery address.");
      ok = false;
    }
    if (!data.city.trim()) {
      setFieldError("city", "Please enter your city.");
      ok = false;
    }
    return ok;
  }

  function buildWhatsAppMessage(data) {
    const qty = currentQty();
    const total = qty * UNIT_PRICE;
    const lines = [
      "New order — TR Perfume",
      "",
      `Name: ${data.name}`,
      `Phone: ${data.phone}`,
      `City: ${data.city}`,
      `Address: ${data.address}`,
      `Quantity: ${qty}`,
      `Total: ${formatRs(total)}`,
    ];
    if (data.notes.trim()) {
      lines.push(`Notes: ${data.notes.trim()}`);
    }
    return lines.join("\n");
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const data = {
      name: document.getElementById("name").value,
      phone: document.getElementById("phone").value,
      city: document.getElementById("city").value,
      address: document.getElementById("address").value,
      notes: document.getElementById("notes").value,
    };

    if (!validate(data)) {
      statusBox.textContent = "Please fix the highlighted fields and try again.";
      statusBox.className = "form-status show error";
      return;
    }

    const message = buildWhatsAppMessage(data);
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

    submitBtn.disabled = true;
    submitBtn.textContent = "Opening WhatsApp…";

    statusBox.textContent =
      "Almost done — WhatsApp is opening with your order filled in. Just hit send there to confirm.";
    statusBox.className = "form-status show success";

    // Opened synchronously inside the submit handler so browsers
    // generally won't block it as a popup.
    const win = window.open(url, "_blank");

    // Fallback in case the popup was blocked (e.g. some in-app browsers).
    if (!win) {
      window.location.href = url;
    }

    submitBtn.disabled = false;
    submitBtn.textContent = "Send Order via WhatsApp";
  });
})();
