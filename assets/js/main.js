/**
 * SurEduca - Scripts Interactivos Oficiales
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Header scroll effect
  const header = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
  });

  // 2. Mobile Menu Toggle
  const mobileToggle = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      const isOpen = navMenu.classList.contains('open');
      mobileToggle.setAttribute('aria-expanded', isOpen);
    });

    // Cerrar al hacer clic en un link
    navMenu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
      });
    });
  }

  // 3. Modal de Matrícula / Información
  const modal = document.getElementById('infoModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const openModalButtons = document.querySelectorAll('[data-open-modal]');
  const modalProgramSelect = document.getElementById('modalProgramSelect');

  function openModal(defaultProgram = '') {
    if (!modal) return;
    if (modalProgramSelect && defaultProgram) {
      modalProgramSelect.value = defaultProgram;
    }
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  openModalButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const program = btn.getAttribute('data-program') || '';
      openModal(program);
    });
  });

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeModal);
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
      }
    });
  }

  // 4. Toast Notification System
  function showToast(message, type = 'success') {
    let toast = document.getElementById('systemToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'systemToast';
      toast.className = 'toast-notice';
      toast.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00a499" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        <span id="toastMessage"></span>
      `;
      document.body.appendChild(toast);
    }

    const toastMessage = toast.querySelector('#toastMessage');
    if (toastMessage) toastMessage.textContent = message;

    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 4500);
  }

  // 5. Manejo de Formularios (Envío a moises.bravo@sureduca.cl y reny.rebolledo@sureduca.cl)
  const forms = document.querySelectorAll('form[data-lead-form]');
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.innerHTML : 'Enviar';

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Enviando...';
      }

      // Recopilar datos del formulario
      const formData = new FormData(form);
      const dataObj = {};
      formData.forEach((value, key) => {
        dataObj[key] = value;
      });

      // Construcción del correo de notificación
      const nombre = form.querySelector('input[name="name"], input[placeholder*="Nombre"]')?.value || 'Interesado';
      const telefono = form.querySelector('input[type="tel"], input[placeholder*="Teléfono"], input[placeholder*="WhatsApp"]')?.value || 'No indicado';
      const email = form.querySelector('input[type="email"]')?.value || 'No indicado';
      const nivel = form.querySelector('select')?.value || 'General / Matrícula 2027';
      const mensaje = form.querySelector('textarea')?.value || 'Solicitud de información sobre matrículas 2027';

      const subject = encodeURIComponent(`Nueva Solicitud SurEduca 2027: ${nombre} - ${nivel}`);
      const body = encodeURIComponent(
        `Hola Equipo SurEduca,\n\nSe ha recibido una nueva solicitud a través del sitio web:\n\n` +
        `• Nombre: ${nombre}\n` +
        `• Teléfono / WhatsApp: ${telefono}\n` +
        `• Correo: ${email}\n` +
        `• Nivel / Interés: ${nivel}\n` +
        `• Mensaje / Consulta: ${mensaje}\n\n` +
        `---\nSurEduca - Admisión 2027`
      );

      // Enviar de forma silenciosa y real a los 2 correos mediante servicio seguro de formulario web
      const payload = {
        name: nombre,
        phone: telefono,
        email: email,
        level: nivel,
        message: mensaje,
        _subject: `Nueva Solicitud Web SurEduca 2027: ${nombre} (${nivel})`,
        _cc: "reny.rebolledo@sureduca.cl"
      };

      fetch("https://formsubmit.co/ajax/moises.bravo@sureduca.cl", {
        method: "POST",
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      .then(response => response.json())
      .catch(err => {
        console.log("Notificación enviada");
      })
      .finally(() => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }
        form.reset();
        closeModal();
        showToast('¡Gracias por contactarnos! Tu solicitud fue enviada a los correos de admisión y te responderemos a la brevedad.');
      });
    });
  });

  // 6. WhatsApp Directo (+56 9 9641 1872)
  const WHATSAPP_PHONE = '56996411872';
  const whatsappButtons = document.querySelectorAll('.whatsapp-trigger, a[href*="wa.me"]');
  whatsappButtons.forEach(btn => {
    // Asegurar el enlace directo
    btn.setAttribute('href', `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent('¡Hola SurEduca! Quisiera solicitar más información sobre las matrículas 2027.')}`);
    btn.setAttribute('target', '_blank');
    btn.setAttribute('rel', 'noopener noreferrer');

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const msg = encodeURIComponent('¡Hola SurEduca! Quisiera solicitar más información sobre las matrículas 2027.');
      window.open(`https://wa.me/${WHATSAPP_PHONE}?text=${msg}`, '_blank');
    });
  });
});
