// Cliente HTTP genérico con timeout y clasificación de errores.
export type ApiErrorKind =
  | 'network' | 'timeout' | 'auth' | 'not_found' | 'server' | 'invalid_response' | 'client';

const MESSAGES: Record<ApiErrorKind, string> = {
  network: 'Sin conexión a Internet. Revisa tu red e inténtalo de nuevo.',
  timeout: 'El servidor tardó demasiado en responder (tiempo de espera agotado).',
  auth: 'Error de autenticación: el servicio rechazó la solicitud (401/403).',
  not_found: 'Recurso no encontrado (404). Verifica la URL del servicio.',
  server: 'Error del servidor (5xx). Intenta más tarde.',
  invalid_response: 'El servidor devolvió una respuesta inválida.',
  client: 'La solicitud no pudo procesarse.',
};

export class ApiError extends Error {
  kind: ApiErrorKind;
  status?: number;
  constructor(kind: ApiErrorKind, detail?: string, status?: number) {
    super(detail ? `${MESSAGES[kind]} ${detail}` : MESSAGES[kind]);
    this.kind = kind;
    this.status = status;
  }
}

export async function httpPost<T>(url: string, body: unknown, timeoutMs = 10000): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (res.status === 401 || res.status === 403) throw new ApiError('auth', undefined, res.status);
    if (res.status === 404) throw new ApiError('not_found', undefined, res.status);
    if (res.status >= 500) throw new ApiError('server', undefined, res.status);

    let data: any;
    try { data = await res.json(); } catch { throw new ApiError('invalid_response', undefined, res.status); }

    if (!res.ok) {
      const detail = data?.errors?.map((e: any) => e.message).join(', ') ?? data?.error;
      throw new ApiError('client', detail, res.status);
    }
    return data as T;
  } catch (e: any) {
    if (e instanceof ApiError) throw e;
    if (e?.name === 'AbortError') throw new ApiError('timeout');
    throw new ApiError('network');
  } finally {
    clearTimeout(timer);
  }
}
