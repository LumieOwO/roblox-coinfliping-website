let socket: WebSocket | null = null;


let connectionAttempts = 0;

export function connectWebSocket(url: string, onMessageCallback: Function) {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    connectionAttempts++;

    if (connectionAttempts > 1) {
      return socket;
    }

    socket = new WebSocket(url);

    socket.onopen = () => {
      connectionAttempts = 0;

      const authToken = checkAuthTokenCookie();
      if (authToken && socket && socket.readyState === WebSocket.OPEN) {
        socket.send(`69/auth "${authToken}"`);
      }
    };

    socket.onmessage = (event) => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        const message = event.data;
        if (onMessageCallback) {
          onMessageCallback(message.toString());
        }
      }
    };

    socket.onerror = (error) => {
      console.log(error);
      if (socket) {
        socket.close();
      }
      connectionAttempts = 0;
    };

    socket.onclose = (event) => {
      console.log(event);
      if (socket) {
        socket.close();
      }
      connectionAttempts = 0;
    };
  }

  return socket;
}


export function sendWebSocketMessage(message: string) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(message);
  }
}

export const checkAuthTokenCookie = (): string | false => {
    const cookies: string[] = document.cookie.split(";");

    for (let i = 0; i < cookies.length; i++) {
      const cookie: string = cookies[i].trim();

      if (cookie.startsWith("AuthToken=")) {
        return cookie.split("AuthToken=")[1];
      }
    }

    return false;
  };  
export const handleExitAccount = (): void => {
    document.cookie =
      "AuthToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.reload();
  };