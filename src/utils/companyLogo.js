import { shortCompanyName } from '../pages/proformaInvoices/piUtils';

// Logo files named after the company (e.g. valuecon.png, notofire.png) are picked up automatically.
const LOGO_URLS = import.meta.glob('../assets/logos/*.{png,jpg,jpeg}', {
  eager: true,
  query: '?url',
  import: 'default',
});

function logoUrlFor(companyName) {
  const key = shortCompanyName(companyName).toLowerCase().split(/\s+/)[0];
  if (!key) return null;
  const match = Object.entries(LOGO_URLS).find(([path]) => path.split('/').pop().toLowerCase().startsWith(key));
  return match ? match[1] : null;
}

/** Company logo as a data URL for jsPDF, or null when the company has no logo file. */
export async function loadCompanyLogo(companyName) {
  const url = logoUrlFor(companyName);
  if (!url) return null;
  try {
    const blob = await (await fetch(url)).blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}
