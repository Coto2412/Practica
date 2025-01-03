import React, { useState, useEffect } from 'react';
import Navbar from './navbar';
import axiosInstance from '../config/axiosConfig';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const PracticaProfesional = () => {
  const [practicas, setPracticas] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const fetchPracticas = async () => {
    try {
      const response = await axiosInstance.get('http://localhost:5000/api/practicas/profesional');
      setPracticas(response.data.data);
    } catch (error) {
      console.error('Error al obtener prácticas:', error);
    }
  };

  useEffect(() => {
    fetchPracticas();
  }, []);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: '¿Eliminar práctica?',
      text: '¿Está seguro de eliminar esta práctica? Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await axiosInstance.delete(`http://localhost:5000/api/practicas/profesional/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        Swal.fire({
          title: '¡Eliminada!',
          text: 'La práctica ha sido eliminada correctamente',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
        fetchPracticas();
      } catch (error) {
        console.error('Error al eliminar:', error);
        Swal.fire({
          title: 'Error',
          text: 'No se pudo eliminar la práctica',
          icon: 'error'
        });
      }
    }
  };

  const filteredPracticas = practicas.filter(practica => 
    practica.estudiante.toLowerCase().includes(searchTerm.toLowerCase()) ||
    practica.empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
    practica.supervisor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gray-100 py-10" 
           style={{
             backgroundImage: 'url("/img/uct.png")',
             backgroundSize: 'cover',
             backgroundPosition: 'center',
           }}>
        <div className="max-w-full mx-auto px-4 py-16">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-xl p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-8">Prácticas Profesionales</h2>

            <div className="mb-6">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="🔍 Buscar por estudiante, empresa o supervisor..."
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>

            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-blue-200">
                  <tr>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Estudiante</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Empresa</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Inicio</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Término</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Supervisor</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Contacto</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Nota</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPracticas.map((practica) => (
                    <tr key={practica.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm">{practica.estudiante}</td>
                      <td className="px-6 py-4 text-sm">{practica.estudiante_email}</td>
                      <td className="px-6 py-4 text-sm">{practica.empresa}</td>
                      <td className="px-6 py-4 text-sm">{practica.fecha_inicio}</td>
                      <td className="px-6 py-4 text-sm">{practica.fecha_termino}</td>
                      <td className="px-6 py-4 text-sm">{practica.supervisor}</td>
                      <td className="px-6 py-4 text-sm">{practica.contacto_supervisor}</td>
                      <td className="px-6 py-4 text-sm">
                        {practica.nota ? (
                          <div className="flex items-center space-x-2">
                            <span>{practica.nota}</span>
                            <button
                              onClick={async () => {
                                const result = await Swal.fire({
                                  title: '¿Eliminar nota?',
                                  text: '¿Estás seguro de que deseas eliminar la nota?',
                                  icon: 'warning',
                                  showCancelButton: true,
                                  confirmButtonColor: '#d33',
                                  cancelButtonColor: '#3085d6',
                                  confirmButtonText: 'Sí, eliminar',
                                  cancelButtonText: 'Cancelar',
                                });

                                if (result.isConfirmed) {
                                  try {
                                    const response = await axiosInstance.put(`http://localhost:5000/api/practicas/${practica.id}`, {
                                      ...practica,
                                      nota: null
                                    });
                                    
                                    if (response.data.status === 'success') {
                                      Swal.fire('Éxito', 'Nota eliminada correctamente', 'success');
                                      fetchPracticas();
                                    }
                                  } catch (error) {
                                    console.error(error);
                                    Swal.fire('Error', 'No se pudo eliminar la nota', 'error');
                                  }
                                }
                              }}
                              className="text-red-600 hover:text-red-800"
                            >
                              <svg 
                                className="w-4 h-4" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24" 
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round" 
                                  strokeWidth={2} 
                                  d="M6 18L18 6M6 6l12 12" 
                                />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-400">Sin nota</span>
                        )}</td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => navigate(`/EditarPracticaProfesional/${practica.id}`)}
                            className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors duration-200"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(practica.id)}
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
            <div className="mt-6 flex justify-end">
              <button 
                className="inline-flex items-center px-4 py-2 bg-green-200 text-green-700 rounded-md hover:bg-green-200 transition-colors duration-200"
                onClick={() => navigate('/NuevaPracticaProfesional')}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                </svg>
                Agregar práctica profesional
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticaProfesional;