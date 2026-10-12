/** wa.me link for a number like "+34 625 08 82 06", with an optional pre-filled message. */
export function whatsappHref(number: string, message?: string) {
  const digits = number.replace(/\D/g, "");
  return `https://wa.me/${digits}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
}

export function telHref(number: string) {
  return `tel:${number.replace(/[^\d+]/g, "")}`;
}
