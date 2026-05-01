const fs = require('fs');

const locales = ['fr', 'en', 'es', 'ht'];

const texts = {
  en: {
    bookingTitle: "Schedule a Call",
    feedbackTitle: "Leave a Message",
    badge: "LET'S TALK",
    title: "Start a project",
    titleAccent: "with us.",
    subtitle: "Tell us about your brand, campaign, or research needs. We work with businesses in Haiti, the Caribbean, and the diaspora. No commitment required.",
    form: {
      nameLabel: "Name",
      namePlaceholder: "John Doe",
      emailLabel: "Email",
      emailPlaceholder: "john@example.com",
      messageLabel: "Message",
      messagePlaceholder: "Tell us about your project...",
      submitButton: "Send Message",
      submittingButton: "Sending...",
      industryLabel: "Industry",
      industryPlaceholder: "Select an industry",
      servicesLabel: "Needs / Services",
      servicesPlaceholder: "Select a service",
      styleLabel: "Vision / Design Style",
      stylePlaceholder: "Select a style"
    },
    cards: {
      whatsappTitle: "WhatsApp",
      whatsappDesc: "For a quick chat",
      telegramTitle: "Telegram",
      telegramDesc: "Secure messaging",
      emailTitle: "Email",
      emailDesc: "For detailed inquiries"
    }
  },
  fr: {
    bookingTitle: "Planifier un appel",
    feedbackTitle: "Laissez un message",
    badge: "PARLONS-EN",
    title: "Démarrez un projet",
    titleAccent: "avec nous.",
    subtitle: "Parlez-nous de votre marque, de votre campagne ou de vos besoins de recherche. Nous travaillons avec des entreprises en Haïti, dans la Caraïbe et dans la diaspora. Sans engagement.",
    form: {
      nameLabel: "Nom",
      namePlaceholder: "Jean Dupont",
      emailLabel: "Email",
      emailPlaceholder: "jean@exemple.com",
      messageLabel: "Message",
      messagePlaceholder: "Parlez-nous de votre projet...",
      submitButton: "Envoyer le message",
      submittingButton: "Envoi en cours...",
      industryLabel: "Secteur d'activité",
      industryPlaceholder: "Sélectionnez un secteur",
      servicesLabel: "Besoins / Services",
      servicesPlaceholder: "Sélectionnez un service",
      styleLabel: "Vision / Style de design",
      stylePlaceholder: "Sélectionnez un style"
    },
    cards: {
      whatsappTitle: "WhatsApp",
      whatsappDesc: "Pour une discussion rapide",
      telegramTitle: "Telegram",
      telegramDesc: "Messagerie sécurisée",
      emailTitle: "Email",
      emailDesc: "Pour les demandes détaillées"
    }
  },
  es: {
    bookingTitle: "Programar una llamada",
    feedbackTitle: "Deja un mensaje",
    badge: "HABLEMOS",
    title: "Inicia un proyecto",
    titleAccent: "con nosotros.",
    subtitle: "Cuéntanos sobre tu marca, campaña o necesidades de investigación. Trabajamos con empresas en Haití, el Caribe y la diáspora. Sin compromiso.",
    form: {
      nameLabel: "Nombre",
      namePlaceholder: "Juan Pérez",
      emailLabel: "Correo Electrónico",
      emailPlaceholder: "juan@ejemplo.com",
      messageLabel: "Mensaje",
      messagePlaceholder: "Háblanos de tu proyecto...",
      submitButton: "Enviar Mensaje",
      submittingButton: "Enviando...",
      industryLabel: "Industria",
      industryPlaceholder: "Selecciona una industria",
      servicesLabel: "Necesidades / Servicios",
      servicesPlaceholder: "Selecciona un servicio",
      styleLabel: "Visión / Estilo de diseño",
      stylePlaceholder: "Selecciona un estilo"
    },
    cards: {
      whatsappTitle: "WhatsApp",
      whatsappDesc: "Para un chat rápido",
      telegramTitle: "Telegram",
      telegramDesc: "Mensajería segura",
      emailTitle: "Correo",
      emailDesc: "Para consultas detalladas"
    }
  },
  ht: {
    bookingTitle: "Pwograme yon apèl",
    feedbackTitle: "Kite yon mesaj",
    badge: "ANN PALE",
    title: "Kòmanse yon pwojè",
    titleAccent: "avèk nou.",
    subtitle: "Pale nou de mak ou a, kanpay, oswa rechèch ou bezwen. Nou travay avèk biznis an Ayiti, nan Karayib la, ak nan dyaspora a. San okenn angajman.",
    form: {
      nameLabel: "Non",
      namePlaceholder: "Jan Pyè",
      emailLabel: "Imèl",
      emailPlaceholder: "jan@egzanp.com",
      messageLabel: "Mesaj",
      messagePlaceholder: "Pale nou de pwojè ou a...",
      submitButton: "Voye Mesaj",
      submittingButton: "Ap voye...",
      industryLabel: "Sektè",
      industryPlaceholder: "Chwazi yon sektè",
      servicesLabel: "Bezwen / Sèvis",
      servicesPlaceholder: "Chwazi yon sèvis",
      styleLabel: "Vizyon / Stil",
      stylePlaceholder: "Chwazi yon stil"
    },
    cards: {
      whatsappTitle: "WhatsApp",
      whatsappDesc: "Pou yon ti koze rapid",
      telegramTitle: "Telegram",
      telegramDesc: "Mesaj an sekirite",
      emailTitle: "Imèl",
      emailDesc: "Pou detay pwofon"
    }
  }
};

for (const loc of locales) {
  const path = `./messages/${loc}.json`;
  const file = fs.readFileSync(path, 'utf-8');
  const data = JSON.parse(file);
  
  data.contactPage = texts[loc];
  
  fs.writeFileSync(path, JSON.stringify(data, null, 2) + '\n', 'utf-8');
  console.log(`Updated ${path}`);
}
