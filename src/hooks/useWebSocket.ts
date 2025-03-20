import { useEffect, useCallback, useState } from 'react';
import { wsService } from '../services/websocket/wsService';
import { API_CONFIG } from '../config/api.config';

interface WebSocketMessage {
  msg_type?: string;
  type?: string;
  account_uuid?: string;
  champion_url?: string;
  [key: string]: unknown;
}

interface UseWebSocketOptions<T> {
  onMessage?: (data: T) => void;
  autoConnect?: boolean;
}

/**
 * useWebSocket: Hook for WebSocket communication with automatic connection management.
 * Inputs: options: UseWebSocketOptions<T> - Configuration options for the WebSocket connection
 * Output: { isConnected: boolean, connect: () => void, disconnect: () => void, send: (payload) => void }
 */
export function useWebSocket<T extends WebSocketMessage>(
  options: UseWebSocketOptions<T> = {}
) {
  const [isConnected, setIsConnected] = useState(false);
  const { onMessage, autoConnect = true } = options;

  /**
   * handleMessage: Handles incoming WebSocket messages and forwards them to the provided callback.
   * Inputs: message: WebSocketMessage - The message received from the WebSocket server
   * Output: void - Calls the onMessage callback if provided
   */
  const handleMessage = useCallback((message: WebSocketMessage) => {
    // Handle both old and new API message formats
    if (onMessage) {
      // Check if this is a Champion API message (has type instead of msg_type)
      if (message.type && !message.msg_type) {
        // Convert to expected format if needed
        const adaptedMessage = {
          ...message,
          msg_type: message.type
        };
        onMessage(adaptedMessage as T);
      } else {
        onMessage(message as T);
      }
    }
  }, [onMessage]);

  /**
   * connect: Establishes a WebSocket connection with the server.
   * Inputs: None
   * Output: void - Sets up the WebSocket connection with message handler
   */
  const connect = useCallback(() => {
    wsService.connect(handleMessage);
  }, [handleMessage]);

  /**
   * disconnect: Closes the WebSocket connection.
   * Inputs: None
   * Output: void - Terminates the WebSocket connection
   */
  const disconnect = useCallback(() => {
    wsService.disconnect();
  }, []);

  /**
   * send: Sends a message to the WebSocket server.
   * Inputs: payload: Record<string, unknown> - The data to send to the server
   * Output: void - Transmits the message through the WebSocket connection
   */
  const send = useCallback((payload: Record<string, unknown>) => {
    const enhancedPayload = {
      ...payload,
      account_uuid: payload.account_uuid || API_CONFIG.ACCOUNT_UUID,
      champion_url: payload.champion_url || API_CONFIG.CHAMPION_API_URL
    };
    
    wsService.send(enhancedPayload);
  }, []);

  // Handle auto-connect and cleanup
  useEffect(() => {
    if (autoConnect) {
      connect();
    }
    // Only disconnect if we initiated the connection
    return () => {
      if (autoConnect) {
        disconnect();
      }
    };
  }, [autoConnect, connect, disconnect]);

  // Track connection status
  useEffect(() => {
    const checkConnection = setInterval(() => {
      const connected = wsService.isConnected();
      setIsConnected(connected);
    }, 100);

    return () => {
      clearInterval(checkConnection);
    };
  }, []);

  return {
    isConnected,
    connect,
    disconnect,
    send
  };
}
