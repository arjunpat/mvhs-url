export const serverHost = process.env.NODE_ENV === 'production' ? 'https://url.mvhs.io'  : 'http://localhost:8080';

export function dateToString(date) {
  let now = Date.now();

  let distance = Date.now() - date;

  if (3600000 > distance && distance > 0) {
    return Math.round(distance / 60000) + ' minutes ago';
  } else if (86400000 > distance && distance > 0) {
    return Math.round((now - date) / 3600000) + ' hours ago';
  }

  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'America/Los_Angeles'
  });
}

export function genQRCodeURL(contents) {
  return `https://chart.googleapis.com/chart?cht=qr&chs=500x500&chld=Q|2&chl=${encodeURIComponent(contents)}`;
}

export function toDataURL(url) {
  return fetch(url, {
    mode: 'cors',
    credentials: 'omit'
  }).then(res => res.blob()).then(blob => URL.createObjectURL(blob));
}
