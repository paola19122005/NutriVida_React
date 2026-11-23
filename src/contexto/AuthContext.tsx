
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  loginUsuario,
  logoutUsuario,
  obtenerUsuarioActual,
  mapUsuario,
  type Usuario,
} from "../services/authService";

interface AuthContextType {
  usuario: Usuario | null;
  cargando: boolean;
  errorConexion: boolean;
  login: (correo: string, clave: string) => Promise<Usuario>;
  logout: () => Promise<void>;
  reintentarSesion: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);
  const [errorConexion, setErrorConexion] = useState(false);

  const reintentarSesion = useCallback(async () => {
    setCargando(true);
    setErrorConexion(false);

    try {
      const resultado = await obtenerUsuarioActual();

      if (resultado.networkError) {
        setUsuario(null);
        setErrorConexion(true);
        return;
      }

      if (resultado.user) {
        setUsuario(mapUsuario(resultado.user));
      } else {
        setUsuario(null);
      }
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void reintentarSesion();
  }, [reintentarSesion]);

  const login = async (
    correo: string,
    clave: string
  ): Promise<Usuario> => {
    const respuesta = await loginUsuario(correo, clave);
    const usuarioAutenticado = mapUsuario(respuesta);

    setUsuario(usuarioAutenticado);
    setErrorConexion(false);

    return usuarioAutenticado;
  };

  const logout = async (): Promise<void> => {
    await logoutUsuario();

    setUsuario(null);
    setErrorConexion(false);
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        cargando,
        errorConexion,
        login,
        logout,
        reintentarSesion,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe utilizarse dentro de AuthProvider.");
  }

  return context;
}
