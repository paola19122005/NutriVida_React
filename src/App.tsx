
import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import Navbar from "./componentes/organismos/Navbar";
import Footer from "./componentes/organismos/Footer";

import Inicio from "./paginas/Inicio";
import Catalogo from "./paginas/Catalogo";
import DetalleServicio from "./paginas/DetalleServicio";
import Lista from "./paginas/Lista";
import Pago from "./paginas/Pago";
import EditarPlan from "./paginas/EditarPlan";
import EditarCitas from "./paginas/EditarCitas";
import PanelPaciente from "./paginas/PanelPaciente";
import Blog from "./paginas/Blog";
import DetalleBlog from "./paginas/DetalleBlog";
import Contacto from "./paginas/Contacto";
import Nosotros from "./paginas/Nosotros";
import Login from "./paginas/Login";
import Registro from "./paginas/Registro";
import AdminDashboard from "./paginas/AdminDashboard";
import AdminServicios from "./paginas/AdminServicio";
import AdminUsuarios from "./paginas/AdminUsuarios";
import AdminMensajesContacto from "./paginas/AdminMensajesContacto";

import { useAuth } from "./contexto/AuthContext";

type Rol = "Administrador" | "Nutricionista" | "Paciente";

interface RutaProtegidaProps {
  children: React.ReactNode;
  rolesPermitidos: Rol[];
}

function RutaProtegida({
  children,
  rolesPermitidos,
}: RutaProtegidaProps) {
  const location = useLocation();
  const { usuario, cargando, errorConexion, reintentarSesion } = useAuth();

  if (cargando) {
    return (
      <main
        className="container"
        style={{ padding: "60px 20px", textAlign: "center" }}
      >
        <p>Verificando sesión...</p>
      </main>
    );
  }

  if (errorConexion) {
    return (
      <main
        className="container"
        style={{ padding: "60px 20px", textAlign: "center" }}
      >
        <h2>No se pudo verificar tu sesión</h2>
        <p>
          No fue posible conectar con el servidor de usuarios.
          Comprueba que el microservicio esté funcionando.
        </p>

        <button
          className="btn btn-primary"
          onClick={() => void reintentarSesion()}
        >
          Intentar nuevamente
        </button>
      </main>
    );
  }

  if (!usuario) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  if (!rolesPermitidos.includes(usuario.rol as Rol)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        {/* Páginas públicas */}
        <Route path="/" element={<Inicio />} />
        <Route path="/catalogo" element={<Catalogo />} />
        <Route path="/servicio/:id" element={<DetalleServicio />} />
        <Route path="/lista" element={<Lista />} />

        <Route path="/pago" element={<Pago />} />
        <Route path="/payment" element={<Pago />} />
        <Route path="/pagar" element={<Pago />} />
        <Route path="/checkout" element={<Pago />} />

        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:id" element={<DetalleBlog />} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/nosotros" element={<Nosotros />} />

        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />

        {/* Administrador y nutricionista */}
        <Route
          path="/admin"
          element={
            <RutaProtegida
              rolesPermitidos={["Administrador", "Nutricionista"]}
            >
              <AdminDashboard />
            </RutaProtegida>
          }
        />

        {/* Solo administrador */}
        <Route
          path="/admin/servicios"
          element={
            <RutaProtegida rolesPermitidos={["Administrador"]}>
              <AdminServicios />
            </RutaProtegida>
          }
        />

        <Route
          path="/admin/usuarios"
          element={
            <RutaProtegida rolesPermitidos={["Administrador"]}>
              <AdminUsuarios />
            </RutaProtegida>
          }
        />

        <Route
          path="/admin/mensajes"
          element={
            <RutaProtegida rolesPermitidos={["Administrador"]}>
              <AdminMensajesContacto />
            </RutaProtegida>
          }
        />

        <Route
          path="/admin/contacto"
          element={
            <RutaProtegida rolesPermitidos={["Administrador"]}>
              <AdminMensajesContacto />
            </RutaProtegida>
          }
        />

        <Route
          path="/admin/mensajes-contacto"
          element={
            <RutaProtegida rolesPermitidos={["Administrador"]}>
              <AdminMensajesContacto />
            </RutaProtegida>
          }
        />

        {/* Solo nutricionista */}
        <Route
          path="/editar-plan"
          element={
            <RutaProtegida rolesPermitidos={["Nutricionista"]}>
              <EditarPlan />
            </RutaProtegida>
          }
        />

        <Route
          path="/editar-citas"
          element={
            <RutaProtegida rolesPermitidos={["Nutricionista"]}>
              <EditarCitas />
            </RutaProtegida>
          }
        />

        {/* Solo paciente */}
        <Route
          path="/perfil-paciente"
          element={
            <RutaProtegida rolesPermitidos={["Paciente"]}>
              <PanelPaciente />
            </RutaProtegida>
          }
        />

        {/* Ruta inexistente */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Footer />
    </>
  );
}

export default App;
