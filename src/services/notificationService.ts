export type NotificationType = 'price_alert' | 'transaction' | 'info' | 'success' | 'error';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  data?: any;
}

type NotificationCallback = (notification: Notification) => void;

class NotificationService {
  private listeners: NotificationCallback[] = [];
  private notifications: Notification[] = [];
  private audio: HTMLAudioElement | null = null;

  constructor() {
    this.audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIFmm98OScTgwOUKvo8bllHAU2jdXvz3UsBSF1x/DdkUAKE2C18Oyrh4UIEHfD8N+QQQoUX7bq7LCJFAk/mtn0xoAqBDSB0PPViTgIG2i78O2gUAwKUazo8LRjHgU7k9TwzHUqBSaAy+/aiTYIGGm48OqcTgwNUPDp8bllHAU4jdXwzHUrBSF1x/DckkEKFGC18OyriBQJEHfD8N+RQQoUX7bq7LCJFAk/mtn0xoAqBDSB0PPVijcIG2i78O2gUAwKUazn8LRkHgU7k9TwzHUqBSaAy+/aiTYIGGm48OqbTwwNUPDp8bllHAU4jdXwzHUrBSF1x/DckkEKFGC18OyriBQJEHfD8N+RQQoUX7bq7LCJFAk/mtn0xoAqBDSB0PPVijcIG2i78O2gUAwKUazn8LRkHgU7k9TwzHUqBSaAy+/aiTYIGGm48OqbTwwNUPDp8bllHAU4jdXwzHUrBSF1x/DckkEKFGC18OyriBQJEHfD8N+RQQoUX7bq7LCJFAk/mtn0xoAqBDSB0PPVijcIG2i78O2gUAwKUazn8LRkHgU7k9TwzHUqBSaAy+/aiTYIGGm48OqbTwwNUPDp8bllHAU4jdXwzHUrBSF1x/DckkEKFGC18OyriBQJEHfD8N+RQQoUX7bq7LCJFAk/mtn0xoAqBDSB0PPVijcIG2i78O2gUAwKUazn8LRkHgU7k9TwzHUqBSaAy+/aiTYIGGm48OqbTwwNU');
  }

  subscribe(callback: NotificationCallback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  notify(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) {
    const newNotification: Notification = {
      ...notification,
      id: crypto.randomUUID(),
      timestamp: new Date(),
      read: false,
    };

    this.notifications.unshift(newNotification);

    if (this.notifications.length > 100) {
      this.notifications = this.notifications.slice(0, 100);
    }

    this.listeners.forEach(listener => listener(newNotification));

    if (notification.type === 'price_alert' || notification.type === 'transaction') {
      this.playSound();
      this.showBrowserNotification(newNotification);
    }

    return newNotification.id;
  }

  playSound() {
    if (this.audio) {
      this.audio.currentTime = 0;
      this.audio.play().catch(err => {
        console.warn('Failed to play notification sound:', err);
      });
    }
  }

  async showBrowserNotification(notification: Notification) {
    if (!('Notification' in window)) {
      return;
    }

    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
      });
    } else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
        });
      }
    }
  }

  getNotifications(): Notification[] {
    return [...this.notifications];
  }

  markAsRead(id: string) {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
    }
  }

  clearAll() {
    this.notifications = [];
  }

  notifyPriceAlert(tokenSymbol: string, oldPrice: number, newPrice: number, changePercent: number) {
    const direction = newPrice > oldPrice ? '📈' : '📉';
    const change = newPrice > oldPrice ? '+' : '';

    this.notify({
      type: 'price_alert',
      title: `${direction} ${tokenSymbol} Price Alert`,
      message: `${tokenSymbol} price changed ${change}${changePercent.toFixed(2)}%: $${oldPrice.toFixed(6)} → $${newPrice.toFixed(6)}`,
      data: {
        tokenSymbol,
        oldPrice,
        newPrice,
        changePercent,
      },
    });
  }

  notifyTransaction(walletName: string, type: 'buy' | 'sell', tokenSymbol: string, amount: number) {
    const icon = type === 'buy' ? '🟢' : '🔴';

    this.notify({
      type: 'transaction',
      title: `${icon} ${walletName} ${type.toUpperCase()}`,
      message: `${walletName} ${type === 'buy' ? 'bought' : 'sold'} ${amount.toFixed(2)} ${tokenSymbol}`,
      data: {
        walletName,
        type,
        tokenSymbol,
        amount,
      },
    });
  }

  notifySuccess(title: string, message: string) {
    this.notify({
      type: 'success',
      title,
      message,
    });
  }

  notifyError(title: string, message: string) {
    this.notify({
      type: 'error',
      title,
      message,
    });
  }

  notifyInfo(title: string, message: string) {
    this.notify({
      type: 'info',
      title,
      message,
    });
  }
}

export const notificationService = new NotificationService();
