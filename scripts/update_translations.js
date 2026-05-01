const fs = require('fs');

function updateJsonFiles() {
  ['en', 'fr', 'es', 'ht'].forEach(lang => {
    try {
      const filePath = `messages/${lang}.json`;
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      
      const translations = {
        en: {
          badge: 'Join the Impact',
          title: 'Ready to Transform',
          titleAccent: 'Your Business?',
          subtitle: 'Book a free diagnostic call with our technical team or leave us a message. We respond within 24 hours.',
          form: {
            nameLabel: 'Name',
            namePlaceholder: 'John Doe',
            emailLabel: 'Email',
            emailPlaceholder: 'john@example.com',
            messageLabel: 'Message',
            messagePlaceholder: 'Tell us about your project...',
            submitButton: 'Send Message',
            submittingButton: 'Sending...'
          },
          cards: {
            whatsappTitle: 'WhatsApp',
            whatsappDesc: 'For a quick chat',
            telegramTitle: 'Telegram',
            telegramDesc: 'Secure messaging',
            emailTitle: 'Email',
            emailDesc: 'For detailed inquiries'
          }
        },
        fr: {
          badge: "Rejoignez l'Impact",
          title: 'Prêt à Transformer',
          titleAccent: 'Votre Entreprise ?',
          subtitle: 'Réservez un appel de diagnostic gratuit avec notre équipe technique ou laissez-nous un message. Nous répondons sous 24 heures.',
          form: {
            nameLabel: 'Nom',
            namePlaceholder: 'Jean Dupont',
            emailLabel: 'Email',
            emailPlaceholder: 'jean@exemple.com',
            messageLabel: 'Message',
            messagePlaceholder: 'Parlez-nous de votre projet...',
            submitButton: 'Envoyer le message',
            submittingButton: 'Envoi en cours...'
          },
          cards: {
            whatsappTitle: 'WhatsApp',
            whatsappDesc: 'Pour une discussion rapide',
            telegramTitle: 'Telegram',
            telegramDesc: 'Messagerie sécurisée',
            emailTitle: 'Email',
            emailDesc: 'Pour les demandes détaillées'
          }
        },
        es: {
          badge: 'Únete al Impacto',
          title: '¿Listo para Transformar',
          titleAccent: 'Tu Negocio?',
          subtitle: 'Reserva una llamada de diagnóstico gratuita con nuestro equipo técnico o déjanos un mensaje. Respondemos en 24 horas.',
          form: {
            nameLabel: 'Nombre',
            namePlaceholder: 'Juan Pérez',
            emailLabel: 'Correo Electrónico',
            emailPlaceholder: 'juan@ejemplo.com',
            messageLabel: 'Mensaje',
            messagePlaceholder: 'Cuéntanos sobre tu proyecto...',
            submitButton: 'Enviar Mensaje',
            submittingButton: 'Enviando...'
          },
          cards: {
            whatsappTitle: 'WhatsApp',
            whatsappDesc: 'Para una charla rápida',
            telegramTitle: 'Telegram',
            telegramDesc: 'Mensajería segura',
            emailTitle: 'Correo',
            emailDesc: 'Para consultas detalladas'
          }
        },
        ht: {
          badge: 'Antre nan Enpak la',
          title: 'Pare pou Transfòme',
          titleAccent: 'Biznis Ou?',
          subtitle: 'Rezève yon apèl dyagnostik gratis ak ekip teknik nou an oswa kite yon mesaj. Nou reponn nan 24 èdtan.',
          form: {
            nameLabel: 'Non',
            namePlaceholder: 'Jan Batis',
            emailLabel: 'Imèl',
            emailPlaceholder: 'jan@egzanp.com',
            messageLabel: 'Mesaj',
            messagePlaceholder: 'Pale nou de pwojè w la...',
            submitButton: 'Voye Mesaj',
            submittingButton: 'Ap Voye...'
          },
          cards: {
            whatsappTitle: 'WhatsApp',
            whatsappDesc: 'Pou yon ti pale rapid',
            telegramTitle: 'Telegram',
            telegramDesc: 'Mesaj an sekirite',
            emailTitle: 'Imèl',
            emailDesc: 'Pou detay ak kesyon'
          }
        }
      };

      data.contactPage = translations[lang];
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
    } catch (e) {
      console.error(e);
    }
  });
}
updateJsonFiles();
