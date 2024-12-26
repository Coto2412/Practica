import React from "react";

const Navbar = () => {
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
            <a href="#" className="text-black hover:text-[#ffffff]">Proyectos de Título</a>
            <a href="#" className="text-black hover:text-[#ffffff]">Inicio</a>
            <a href="#" className="text-black hover:text-[#ffffff]">Inicio</a>
            <a href="#" className="text-black hover:text-[#ffffff]">Inicio</a>
        </div>
        <div className="flex space-x-4">
            <button className="flex items-center space-x-2 bg-[#1C03FF] text-white px-5 py-2 rounded-full hover:opacity-90">
                Cerrar sesión
            </button>
        </div>
    </nav>
  );
};

export default Navbar;
