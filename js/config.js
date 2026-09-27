export const CONFIG = {
  brand: {
    name: "Almeida & Prado",
    monogram: "AP",
    descriptor: "Advocacia",
    oab: "OAB/SP 42.118",
  },
  contact: {
    whatsapp: "5511900000000",
    whatsappDefaultMessage:
      "Olá! Gostaria de agendar uma consulta com um advogado.",
    phoneDisplay: "(11) 3000-0000",
    phoneHref: "+551130000000",
    email: "contato@exemplo.com.br",
    addressStreet: "Av. Paulista, 1000 — conj. 120",
    addressNeighborhood: "Bela Vista",
    addressCity: "São Paulo",
    addressState: "SP",
    addressCep: "01310-100",
    addressMapUrl:
      "https://www.google.com/maps/search/?api=1&query=Av.+Paulista+1000+S%C3%A3o+Paulo",
    hours: "Seg a sex, 9h às 19h — Plantão judicial aos sábados",
  },
  social: [
    { label: "LinkedIn", href: "https://www.linkedin.com/", icon: "linkedin" },
    { label: "Instagram", href: "https://www.instagram.com/", icon: "instagram" },
    { label: "Facebook", href: "https://www.facebook.com/", icon: "facebook" },
  ],
  messages: {
    hero: "Olá! Gostaria de agendar uma consulta com um advogado.",
    areas: "Olá! Gostaria de entender como o escritório pode atuar no meu caso.",
    process: "Olá! Tenho dúvidas sobre como funciona o processo.",
    faq: "Olá! Tenho uma dúvida que não encontrei no site.",
    fab: "Olá! Gostaria de falar com um advogado sobre o meu caso.",
  },
  seo: {
    url: "https://exemplo.com.br/",
    ogImage: "assets/og-image.png",
  },
};

export function whatsappLink(message = CONFIG.contact.whatsappDefaultMessage) {
  return `https://wa.me/${CONFIG.contact.whatsapp}?text=${encodeURIComponent(message)}`;
}

export function fullAddress() {
  const { contact } = CONFIG;
  return `${contact.addressStreet} · ${contact.addressNeighborhood} — ${contact.addressCity}/${contact.addressState} · CEP ${contact.addressCep}`;
}
