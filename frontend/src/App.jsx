import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/login';
import Register from './pages/register';
import AluTitulos from './pages/alutitulos';
import AdminProfesores from './pages/admiprof';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/Registro" element={<Register />} />
        <Route path="/ProyectosTitulo" element={<AluTitulos />} />
        <Route path="/AdminProfesores" element={<AdminProfesores />} />
      </Routes>
    </Router>
  );
}
export default App
