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
      document.body.appendChild(toast);
    }

    // Configurar icono y color según el tipo
    const iconColor = type === 'success' ? '#00a499' : (type === 'warning' ? '#f59e0b' : '#ef4444');
    const borderColor = type === 'success' ? 'var(--primary-teal, #00a499)' : (type === 'warning' ? '#f59e0b' : '#ef4444');
    
    toast.style.borderLeftColor = borderColor;
    toast.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        ${type === 'success' 
          ? '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>' 
          : '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>'}
      </svg>
      <span id="toastMessage">${message}</span>
    `;

    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 5500);
  }

  // 5. Manejo de Formularios (Envío a reny.rebolledo@sureduca.cl y moises.bravo@sureduca.cl + Confirmación al postulante)
  const forms = document.querySelectorAll('form[data-lead-form]');
  forms.forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.innerHTML : 'Enviar';

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Enviando...';
      }

      // Recopilar datos del formulario con selectores flexibles
      const nombre = form.querySelector('input[name="name"], input[name="nombre"], input[placeholder*="Nombre"]')?.value?.trim() || 'Interesado';
      const telefono = form.querySelector('input[type="tel"], input[name="phone"], input[name="telefono"], input[placeholder*="Teléfono"], input[placeholder*="WhatsApp"]')?.value?.trim() || 'No indicado';
      const email = form.querySelector('input[type="email"], input[name="email"]')?.value?.trim() || '';
      const nivel = form.querySelector('select')?.value || 'General / Matrícula 2027';
      const mensaje = form.querySelector('textarea')?.value?.trim() || 'Solicitud de información sobre matrículas 2027';

      // Mensaje cordial de auto-respuesta enviado automáticamente al correo del solicitante
      const autoResponseText = 
`Estimado(a) ${nombre},

¡Muchas gracias por tu interés en SurEduca!

Hemos recibido con éxito tus datos para la postulación e información del proceso de Matrícula 2027.

Resumen de la información registrada:
• Programa / Nivel de interés: ${nivel}
• Teléfono de contacto: ${telefono}
• Correo electrónico: ${email}
• Consulta o mensaje: ${mensaje}

Uno de nuestros coordinadores pedagógicos revisará tu solicitud y se pondrá en contacto contigo a la brevedad posible a través de WhatsApp o llamada telefónica para orientarte en detalle.

Si deseas comunicarte de inmediato con nosotros:
• WhatsApp Oficial Admisiones: +56 9 9641 1872
• Sitio Web: https://sureduca.cl

Atentamente,
Equipo de Admisión y Matrículas 2027
Fundación Educacional SurEduca Chile`;

      // Payload organizado para FormSubmit
      const payload = {
        "Nombre del Solicitante": nombre,
        "Teléfono / WhatsApp": telefono,
        "Correo Electrónico": email,
        "Programa o Nivel de Interés": nivel,
        "Mensaje o Consulta": mensaje,
        "Fecha de Envío": new Date().toLocaleString('es-CL'),
        "_subject": `Nueva Solicitud Matrícula SurEduca 2027: ${nombre} (${nivel})`,
        "_cc": "moises.bravo@sureduca.cl",
        "_replyto": email,
        "_template": "table",
        "_captcha": "false",
        "_autoresponse": autoResponseText
      };

      try {
        const response = await fetch("https://formsubmit.co/ajax/reny.rebolledo@sureduca.cl", {
          method: "POST",
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        const result = await response.json().catch(() => ({}));

        if (response.ok && (result.success === true || result.success === "true")) {
          showToast('¡Solicitud enviada con éxito! Te hemos enviado un correo de confirmación y te contactaremos prontamente.', 'success');
          form.reset();
          closeModal();
        } else if (result.message && result.message.includes('Activation')) {
          console.warn("FormSubmit requiere activación:", result.message);
          showToast('Formulario pendiente de activación: Revisa el correo de confirmación de FormSubmit en tu bandeja.', 'warning');
        } else if (window.location.protocol === 'file:') {
          console.warn("Aviso de seguridad del navegador: FormSubmit no admite envío desde archivos locales file://.");
          showToast('Para probar envíos reales debes abrir la web a través de un servidor (Live Server, localhost o Vercel).', 'warning');
        } else {
          showToast(result.message || 'No se pudo completar el envío. Por favor contáctanos directo a WhatsApp.', 'error');
        }
      } catch (err) {
        console.error("Error al enviar formulario:", err);
        showToast('Error de conexión al enviar. Puedes escribirnos directo al WhatsApp +56 9 9641 1872.', 'error');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }
      }
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

  // 7. Sistema de Pestañas (Cursos / Servicios para Colegios y Temario 5° a 8°)
  document.querySelectorAll('.tabs-bar').forEach(tabBar => {
    const buttons = tabBar.querySelectorAll('[data-tab-target]');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-tab-target');
        const targetPanel = document.getElementById(targetId);
        if (!targetPanel) return;

        // Desactivar botones de esta barra
        buttons.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });

        // Ocultar paneles hermanos de esta sección
        const parentSection = tabBar.parentElement;
        parentSection?.querySelectorAll('.tab-panel').forEach(panel => {
          panel.classList.remove('active');
        });

        // Activar seleccionado
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        targetPanel.classList.add('active');
      });
    });
  });
});
