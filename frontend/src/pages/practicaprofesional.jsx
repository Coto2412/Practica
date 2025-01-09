import React, { useState, useEffect } from 'react';
import Navbar from '../components/navbar';
import Swal from 'sweetalert2';
import axiosInstance from '../config/axiosConfig';
import { useNavigate } from 'react-router-dom';
import PracticaAcordeon from '../components/practica-acordeon';

const PracticaProfesional = () => {
  const navigate = useNavigate();
  const [practicas, setPracticas] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'accordion'

  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    fetchPracticas();
  }, []);

  const fetchPracticas = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`${API_URL}/practicas/profesional`);
      if (response.data.status === 'success') {
        console.log('Datos recibidos:', response.data.data); // Agregar este log
        setPracticas(response.data.data);
      }
    } catch (err) {
      setError('Error al cargar las prácticas');
      console.error('Error completo:', err); // Modificar este log
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: 'Esta acción no se puede deshacer.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
      });

      if (result.isConfirmed) {
        const response = await axiosInstance.delete(`${API_URL}/practicas/${id}`);
        if (response.data.status === 'success') {
          Swal.fire('Eliminado', 'La práctica ha sido eliminada.', 'success');
          fetchPracticas();
        }
      }
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'No se pudo eliminar la práctica.', 'error');
    }
  };

  const filteredPracticas = practicas.filter(
    (practica) =>
      practica.estudiante.toLowerCase().includes(searchTerm.toLowerCase()) ||
      practica.empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      practica.supervisor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl font-semibold text-gray-600">Cargando prácticas...</div>
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
      <div
        className="min-h-screen bg-gray-100 py-10"
        style={{
          backgroundImage: 'url("/img/uct.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="max-w-full mx-auto px-4 py-16">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-xl p-6">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-semibold text-gray-800">Prácticas Profesionales</h2>
              <div className="flex space-x-4">
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-4 py-2 rounded-md ${
                    viewMode === 'table'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Vista Tabla Completa
                </button>
                <button
                  onClick={() => setViewMode('accordion')}
                  className={`px-4 py-2 rounded-md ${
                    viewMode === 'accordion'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Vista por Fecha
                </button>
              </div>
            </div>

            <div className="mb-6">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="🔍 Buscar por estudiante, empresa o supervisor..."
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>

            {viewMode === 'accordion' ? (
              <PracticaAcordeon
                practicas={filteredPracticas}
                handleDelete={handleDelete}
                fetchPracticas={fetchPracticas}
                axiosInstance={axiosInstance}
                API_URL={API_URL}
                tipoPractica="profesional"
              />
            ) : (
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
                                      const response = await axiosInstance.put(`${API_URL}/practicas/${practica.id}`, {
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
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          ) : (
                            <span className="text-gray-400">Sin nota</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex justify-center space-x-2">
                            <button
                              className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors duration-200"
                              onClick={() => navigate(`/EditarPracticaProfesional/${practica.id}`)}
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Editar
                            </button>
                            <button
                              className="inline-flex items-center px-3 py-1.5 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors duration-200"
                              onClick={() => handleDelete(practica.id)}
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Eliminar
                            </button>
                              <button
                                className="inline-flex items-center px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 transition-colors duration-200"
                                onClick={async () => {
                                  const documentTypes = {
                                    carta_supervisor: 'Carta del Supervisor',
                                    certificado_alumno: 'Certificado del Alumno',
                                    formulario_inscripcion: 'Formulario de Inscripción',
                                    autorizacion_empresa: 'Autorización de la Empresa'
                                  };

                                  // Verificar los datos de la práctica
                                  console.log('Práctica antes de procesar:', practica);

                                  // Crear la lista de documentos disponibles
                                  const documentsList = Object.entries(documentTypes)
                                    .map(([key, title]) => {
                                      // Verificar explícitamente si el documento existe y no es null/undefined
                                      if (practica[key] && practica[key].length > 0) {
                                        return {
                                          type: key,
                                          title,
                                          filepath: practica[key]
                                        };
                                      }
                                      return null;
                                    })
                                    .filter(Boolean);

                                  console.log('Lista de documentos procesada:', documentsList);

                                  // Crear las funciones de manejo
                                  const handleDownload = async (type) => {
                                    try {
                                      const response = await axiosInstance.get(
                                        `${API_URL}/documentos/descargar/${type}/${practica.id}`,
                                        { responseType: 'blob' }
                                      );
                                      
                                      const url = window.URL.createObjectURL(new Blob([response.data]));
                                      const link = document.createElement('a');
                                      link.href = url;
                                      link.setAttribute('download', practica[type].split('/').pop());
                                      document.body.appendChild(link);
                                      link.click();
                                      link.remove();
                                    } catch (error) {
                                      console.error('Error en descarga:', error);
                                      Swal.fire('Error', 'No se pudo descargar el documento', 'error');
                                    }
                                  };

                                  const handleDelete = async (type) => {
                                    const result = await Swal.fire({
                                      title: '¿Eliminar documento?',
                                      text: '¿Estás seguro de que deseas eliminar este documento?',
                                      icon: 'warning',
                                      showCancelButton: true,
                                      confirmButtonColor: '#d33',
                                      cancelButtonColor: '#3085d6',
                                      confirmButtonText: 'Sí, eliminar',
                                      cancelButtonText: 'Cancelar'
                                    });

                                    if (result.isConfirmed) {
                                      try {
                                        const response = await axiosInstance.delete(
                                          `${API_URL}/documentos/${type}/${practica.id}`
                                        );
                                        
                                        if (response.data.status === 'success') {
                                          Swal.fire('Éxito', 'Documento eliminado correctamente', 'success')
                                            .then(() => {
                                              fetchPracticas();
                                            });
                                        }
                                      } catch (error) {
                                        console.error('Error en eliminación:', error);
                                        Swal.fire('Error', 'No se pudo eliminar el documento', 'error');
                                      }
                                    }
                                  };

                                  // Asignar las funciones al objeto window
                                  window.handleDownload = handleDownload;
                                  window.handleDelete = handleDelete;

                                  await Swal.fire({
                                    title: 'Documentos de la Práctica',
                                    html: documentsList.length > 0 
                                      ? documentsList.map(doc => `
                                        <div class="flex justify-between items-center p-2 border-b">
                                          <span>${doc.title}</span>
                                          <div>
                                            <button 
                                              onclick="handleDownload('${doc.type}')"
                                              class="px-3 py-1 bg-blue-500 text-white rounded-md mx-1 text-sm"
                                            >
                                              Descargar
                                            </button>
                                            <button 
                                              onclick="handleDelete('${doc.type}')"
                                              class="px-3 py-1 bg-red-500 text-white rounded-md mx-1 text-sm"
                                            >
                                              Eliminar
                                            </button>
                                          </div>
                                        </div>
                                      `).join('')
                                      : '<p class="text-gray-500">No hay documentos disponibles</p>',
                                    showCloseButton: true,
                                    showConfirmButton: false,
                                    width: '600px'
                                  });
                                }}
                              >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Ver Documentos
                              </button>                        
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="mt-6 flex justify-end">
              <button 
                className="inline-flex items-center px-4 py-2 bg-green-200 text-green-700 rounded-md hover:bg-green-300 transition-colors duration-200"
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