import React, { useState, useEffect } from 'react';
import Navbar from "../components/navbar";
import Swal from 'sweetalert2';
import axiosInstance from '../config/axiosConfig';

const ProyectosFinalizados = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProyectosFinalizados();
  }, []);

  const fetchProyectosFinalizados = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/proyectos/finalizados');
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
            const response = await axiosInstance.put(`/proyectos/${proyecto.id}/finalizar`, {
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

  const handleDelete = async (proyecto) => {
    try {
      const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: `¿Deseas eliminar el proyecto "${proyecto.proyecto_titulo}"?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        backdrop: `
          rgba(0,0,0,0.4)
          center
          no-repeat
        `,
        allowOutsideClick: false,
        allowEscapeKey: false
      });

      if (result.isConfirmed) {
        const response = await axiosInstance.delete(`/proyectos/${proyecto.id}`);
        
        if (response.data.status === 'success') {
          await Swal.fire({
            title: '¡Eliminado!',
            text: 'El proyecto ha sido eliminado correctamente',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          });
          fetchProyectosFinalizados();
        } else {
          throw new Error(response.data.error || 'Error al eliminar el proyecto');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      await Swal.fire({
        title: 'Error',
        text: 'No se pudo eliminar el proyecto',
        icon: 'error'
      });
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
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button 
                            onClick={() => handleEditNota(proyecto)}
                            className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors duration-200"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Editar Nota
                          </button>
                          <button 
                            onClick={() => handleDelete(proyecto)}
                            className="inline-flex items-center px-3 py-1.5 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors duration-200"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Eliminar
                          </button>
                        </div>
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