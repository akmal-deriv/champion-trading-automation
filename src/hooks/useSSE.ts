/**
 * @file: useSSE.ts
 * @description: Custom React hook for managing Server-Sent Events (SSE) connections,
 *               providing connection state tracking and automatic reconnection.
 *
 * @components: useSSE - Hook for SSE connection management
 * @dependencies:
 *   - React hooks: useEffect, useCallback, useState
 *   - sseService: Service for SSE connection handling
 *   - SSEHeaders: Type definition for SSE headers
 * @usage:
 *   const { isConnected, connect, disconnect } = useSSE<DataType>({
 *     url: 'https://api.example.com/events',
 *     headers: { Authorization: 'Bearer token' },
 *     onMessage: (data) => console.log(data),
 *     autoConnect: true
 *   });
 *
 * @architecture: Custom React hook with connection state management
 * @relationships:
 *   - Uses: sseService for actual SSE connection handling
 *   - Used by: Components and other hooks that need SSE functionality
 * @dataFlow:
 *   - Input: Connection options (url, headers, callbacks)
 *   - Processing: Establishes connection, handles messages, tracks state
 *   - Output: Connection state and control functions
 *
 * @ai-hints: This hook uses React's useCallback for memoized functions and
 *            useEffect for connection lifecycle management. It's generic-typed
 *            to support different message data structures.
 */
import { useEffect, useCallback, useState } from 'react';
import { sseService } from '../services/sse/sseService';
import { SSEHeaders } from '../types/sse';

interface UseSSEOptions<T> {
  url: string;
  headers: SSEHeaders;
  onMessage?: (data: T) => void;
  onError?: (error: Event) => void;
  onOpen?: (event: Event) => void;
  autoConnect?: boolean;
  withCredentials?: boolean;
}

export function useSSE<T = any>(
  options: UseSSEOptions<T>
) {
  const [isConnected, setIsConnected] = useState(false);
  const {
    url,
    headers,
    onMessage,
    onError,
    onOpen,
    autoConnect = true,
    withCredentials = true
  } = options;

  const handleMessage = useCallback((event: MessageEvent) => {
    if (onMessage) {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (error) {
        console.error('Failed to parse SSE message:', error);
      }
    }
  }, [onMessage]);

  const connect = useCallback(() => {
    sseService.connect({
      url,
      headers,
      withCredentials,
      onMessage: handleMessage,
      onError,
      onOpen
    });
  }, [url, headers, withCredentials, handleMessage, onError, onOpen]);

  const disconnect = useCallback(() => {
    sseService.disconnect();
  }, []);

  // Handle auto-connect and cleanup
  useEffect(() => {
    if (autoConnect) {
      connect();
    }
    return () => {
      if (autoConnect) {
        disconnect();
      }
    };
  }, [autoConnect, connect, disconnect]);

  // Track connection status
  useEffect(() => {
    const checkConnection = setInterval(() => {
      const connected = sseService.isConnected();
      setIsConnected(connected);
    }, 1000);

    return () => {
      clearInterval(checkConnection);
    };
  }, []);

  return {
    isConnected,
    connect,
    disconnect
  };
}
