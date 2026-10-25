/** Local notifications adapter (web). Capacitor LocalNotifications can replace the body later. */
export async function requestNotifyPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  return (await Notification.requestPermission()) === 'granted';
}
export function notify(title: string, body: string): boolean {
  if (!('Notification' in window) || Notification.permission !== 'granted') return false;
  try { new Notification(title, { body, icon: '/icons/icon-192.png' }); return true; } catch { return false; }
}
