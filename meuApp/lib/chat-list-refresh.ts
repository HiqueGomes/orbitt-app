/**
 * Permite notificar a tela de lista de conversas para recarregar
 * (ex.: após desfazer match ou bloquear na conversa).
 */
type Listener = () => void;
let listeners: Listener[] = [];

export function subscribeChatListRefresh(fn: Listener): () => void {
  listeners.push(fn);
  return () => {
    listeners = listeners.filter((l) => l !== fn);
  };
}

export function notifyChatListRefresh(): void {
  listeners.forEach((fn) => {
    try {
      fn();
    } catch (e) {
      console.warn('chat-list-refresh listener error', e);
    }
  });
}
