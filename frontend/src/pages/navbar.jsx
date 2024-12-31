import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const links = [
    { path: "/ProyectosTitulo", label: "Proyectos de Título" },
    { path: "/AdminProfesores", label: "Administrar Profesores" },
    { path: "/ProyectosFinalizados", label: "Proyectos Finalizados" },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/'); 
  };

  return (
    <nav className="flex justify-between items-center bg-[#4EB5F5] p-6 shadow-md">
      <div className="flex items-center">
        <img
          src="/img/Logo_ing_civil_informatica.png"
          alt="Logo Universidad Católica de Temuco"
          className="w-15 h-12 mr-5"
        />
      </div>
      <div className="flex space-x-6">
        {links.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`text-white hover:text-[#000000] ${
              location.pathname === link.path ? "font-bold underline" : ""
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>
      <div className="flex space-x-4">
        <button 
          onClick={handleLogout}
          className="flex items-center space-x-2 bg-[#1C03FF] text-white px-5 py-2 rounded-full hover:opacity-60"
        >
          Cerrar sesión
        </button>
      </div>
    </nav>
  );
};

export default Navbar;