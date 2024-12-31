import React, { useState, useEffect } from 'react';
import Navbar from "./navbar";
import axios from 'axios';
import Swal from 'sweetalert2';

const ProyectosFinalizados = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    fetchProyectosFinalizados();
  }, []);

  const fetchProyectosFinalizados = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/proyectos/finalizados`);
      if (response.data.status === 'success') {
        setProyectos(response.data.data);
      }
    } catch (err) {
      setError('Error al cargar los proyectos finalizados');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditNota = async (proyecto) => {
    try {
      const result = await Swal.fire({
        title: 'Editar Nota',
        input: 'number',
        inputLabel: 'Nueva nota',
        inputValue: proyecto.nota,
        inputAttributes: {
          min: '1.0',
          max: '7.0',
          step: '0.1'
        },
        showCancelButton: true,
        confirmButtonText: 'Guardar',
        cancelButtonText: 'Cancelar',
        backdrop: `
          rgba(0,0,0,0.4)
          center
          no-repeat
        `,
        allowOutsideClick: false,
        allowEscapeKey: false,
        showLoaderOnConfirm: true,
        didOpen: () => {
          document.body.style.overflow = 'hidden';
        },
        willClose: () => {
          document.body.style.overflow = 'unset';
        },
        preConfirm: async (nuevaNota) => {
          if (!nuevaNota) {
            Swal.showValidationMessage('Debes ingresar una nota');
            return false;
          }
          const nota = parseFloat(nuevaNota);
          if (nota < 1.0 || nota > 7.0) {
            Swal.showValidationMessage('La nota debe estar entre 1.0 y 7.0');
            return false;
          }
          try {
            const response = await axios.put(`${API_URL}/proyectos/${proyecto.id}/finalizar`, {
              nota: nota
            });
            if (response.data.status === 'success') {
              return true;
            }
            throw new Error(response.data.error || 'Error al actualizar la nota');
          } catch (error) {
            Swal.showValidationMessage(
              `Error: ${error.response?.data?.error || 'No se pudo actualizar la nota'}`
            );
            return false;
          }
        }
      });

      if (result.isConfirmed) {
        await Swal.fire({
          title: '¡Éxito!',
          text: 'Nota actualizada correctamente',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
        fetchProyectosFinalizados();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const filteredProyectos = proyectos.filter(proyecto =>
    proyecto.estudiante.toLowerCase().includes(searchTerm.toLowerCase()) ||
    proyecto.correo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    proyecto.proyecto_titulo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl font-semibold text-gray-600">Cargando proyectos finalizados...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl font-semibold text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gray-100 py-10"
        style={{
          backgroundImage: 'url("/img/uct.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-xl p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-8">Proyectos de Título Finalizados</h2>
            
            <div className="mb-6">
              <input
                type="text"
                placeholder="🔍 Buscar por estudiante o proyecto..."
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="overflow-hidden border border-gray-200 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-blue-200">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estudiante
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Correo
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Proyecto de título
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Profesor Guía
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Profesor Informante
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nota
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProyectos.map((proyecto) => (
                    <tr key={proyecto.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {proyecto.estudiante}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {proyecto.correo}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {proyecto.proyecto_titulo}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {proyecto.profesor_guia}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {proyecto.profesor_informante}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 text-center">
                        {proyecto.nota.toFixed(1)}
                      </td>
                      <td className={`px-6 py-4 text-sm text-center ${
                        proyecto.estado === 'Aprobado' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {proyecto.estado}
                      </td>
                      <td className="px-6 py-4 text-sm text-center">
                        <button
                          onClick={() => handleEditNota(proyecto)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                        >
                          Editar Nota
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProyectosFinalizados;