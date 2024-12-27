import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/login';
import Register from './pages/register';
import AluTitulos from './pages/alutitulos';
import AdminProfesores from './pages/admiprof';
import NuevoProyecto from './pages/nuevoproyecto';
import EditarProyecto from './pages/editarproyecto';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/Registro" element={<Register />} />
        <Route path="/ProyectosTitulo" element={<AluTitulos />} />
        <Route path="/AdminProfesores" element={<AdminProfesores />} />
        <Route path="/NuevoProyecto" element={<NuevoProyecto />} />
        <Route path="/EditarProyecto/:id" element={<EditarProyecto />} />
      </Routes>
    </Router>
  );
}
export default App
