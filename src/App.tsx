import { Routes, Route } from "react-router-dom";
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

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/catalogo" element={<Catalogo />} />
        <Route path="/servicio/:id" element={<DetalleServicio />} />
        <Route path="/lista" element={<Lista />} />
<Route path="/pago" element={<Pago />} />
<Route path="/payment" element={<Pago />} />
<Route path="/pagar" element={<Pago />} />
<Route path="/checkout" element={<Pago />} />
<Route path="/editar-plan" element={<EditarPlan />} />
<Route path="/editar-citas" element={<EditarCitas />} />
<Route path="/perfil-paciente" element={<PanelPaciente />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:id" element={<DetalleBlog />} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/nosotros" element={<Nosotros />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/servicios" element={<AdminServicios />} />
        <Route path="/admin/usuarios" element={<AdminUsuarios />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
