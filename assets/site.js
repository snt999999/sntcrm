document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("leadForm");
  const note = document.getElementById("formNote");
  const submitBtn = document.getElementById("leadSubmitBtn");
  const startedAt = document.getElementById("formStartedAt");

  if (startedAt) startedAt.value = String(Date.now());

  if (form) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());
      const originalText = submitBtn ? submitBtn.textContent : "";

      setFormState(true, "Отправляем заявку...");

      try {
        const response = await fetch("/create-public-lead", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });

        const result = await response.json().catch(() => ({}));

        if (!response.ok || !result.ok) {
          throw new Error(result.error || "Заявку не удалось отправить");
        }

        const emailText = result.emailSent
          ? "Копия заявки отправлена на почту."
          : "Заявка отправлена. Мы свяжемся с вами в ближайшее время.";

        if (note) {
          note.textContent = `Заявка отправлена. Мы свяжемся с вами в ближайшее время. ${emailText}`;
          note.classList.remove("is-error");
          note.classList.add("is-success");
        }

        form.reset();
        if (startedAt) startedAt.value = String(Date.now());
      } catch (error) {
        if (note) {
          note.textContent = `${error.message}. Можно написать нам напрямую в Telegram или MAX — текст заявки скопирован в буфер.`;
          note.classList.remove("is-success");
          note.classList.add("is-error");
        }
        await copyLeadText(data);
        highlightMessengers();
      } finally {
        setFormState(false, originalText || "Отправить заявку");
      }
    });
  }


  async function initHeroVideo() {
    const media = document.querySelector("[data-hero-media]");
    if (!media) return;

    const videoSrc = media.dataset.videoSrc || "assets/video/hero.mp4";
    const poster = media.dataset.videoPoster || "assets/img/hero-solncanet.webp";

    try {
      const response = await fetch(videoSrc, { method: "HEAD", cache: "no-store" });
      if (!response.ok) return;

      const video = document.createElement("video");
      video.autoplay = true;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.poster = poster;
      video.setAttribute("aria-label", "СОЛНЦАНЕТ — видео о продаже и установке плёнок");

      const source = document.createElement("source");
      source.src = videoSrc;
      source.type = "video/mp4";
      video.appendChild(source);

      media.innerHTML = "";
      media.appendChild(video);
    } catch (_) {
      // Если видео ещё не загружено в проект, показываем обычное фото.
    }
  }

  initHeroVideo();

  document.querySelectorAll(".floating-contact__main").forEach((button) => {
    button.addEventListener("click", () => {
      const root = button.closest(".floating-contact");
      if (root) root.classList.toggle("is-open");
    });
  });

  document.addEventListener("click", (event) => {
    document.querySelectorAll(".floating-contact.is-open").forEach((root) => {
      if (!root.contains(event.target)) root.classList.remove("is-open");
    });
  });

  function setFormState(isLoading, text) {
    if (!submitBtn) return;
    submitBtn.disabled = isLoading;
    submitBtn.textContent = text;
  }

  async function copyLeadText(data) {
    const text = [
      "Здравствуйте! Хочу оставить заявку в СОЛНЦАНЕТ.",
      "",
      "Имя: " + (data.name || ""),
      "Телефон: " + (data.phone || ""),
      "Компания: " + (data.companyName || ""),
      "Услуга: " + (data.service || ""),
      "Дата: " + (data.preferredDate || ""),
      "Время: " + (data.preferredTime || ""),
      "Адрес: " + (data.address || ""),
      "Информация об объекте: " + (data.objectInfo || ""),
      "Комментарий: " + (data.task || "")
    ].join("\n");

    try {
      await navigator.clipboard.writeText(text);
    } catch (_) {
      // Если браузер запретил буфер, просто оставляем сообщение с кнопками связи.
    }
  }

  function highlightMessengers() {
    const choice = document.getElementById("messengerChoice");
    if (!choice) return;
    choice.scrollIntoView({ behavior: "smooth", block: "center" });
    choice.classList.add("contact-choice--highlight");
    setTimeout(() => choice.classList.remove("contact-choice--highlight"), 1800);
  }
});
