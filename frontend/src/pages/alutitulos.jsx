import React, { useState, useEffect } from 'react';
import Navbar from "../components/navbar";
import Swal from 'sweetalert2';
import axiosInstance from '../config/axiosConfig';
import { useNavigate } from 'react-router-dom';

const AluTitulos = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [estudiantes, setEstudiantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProyectos();
  }, []);

  const fetchProyectos = async () => {
    try {
        setLoading(true);
        const response = await axiosInstance.get('/proyectos');
        if (response.data.status === 'success') {
            
            const transformedData = response.data.data.map(item => ({
                id: item.id, 
                name: item.estudiante,
                email: item.correo,
                projectTitle: item.proyecto_titulo,
                profesorGuia: item.profesor_guia,
                profesorInformante: item.profesor_informante
            }));
            setEstudiantes(transformedData);
        }
    } catch (err) {
        setError('Error al cargar los proyectos');
        console.error('Error:', err);
    } finally {
        setLoading(false);
    }
  };

  const handleView = async (id) => {
    try {
      const response = await axiosInstance.get(`/proyectos/${id}`);
      if (response.data.status === 'success') {
        const proyecto = response.data.proyecto;
        
        const estudiante = estudiantes.find(e => e.id === id);
        
        Swal.fire({
          title: 'Detalles del Proyecto',
          html: `
            <div class="text-left">
              <div class="mb-4">
                <h3 class="text-lg font-semibold text-blue-600">Información del Proyecto</h3>
                <p><strong>Título:</strong> ${proyecto.titulo}</p>
                <p><strong>Descripción:</strong> ${proyecto.descripcion || 'No disponible'}</p>
              </div>
              
              <div class="mb-4">
                <h3 class="text-lg font-semibold text-blue-600">Estudiante</h3>
                <p><strong>Nombre:</strong> ${estudiante.name}</p>
                <p><strong>Email:</strong> ${estudiante.email}</p>
              </div>
              
              <div class="mb-4">
                <h3 class="text-lg font-semibold text-blue-600">Profesores</h3>
                <p><strong>Profesor Guía:</strong> ${estudiante.profesorGuia}</p>
                <p><strong>Profesor Informante:</strong> ${estudiante.profesorInformante}</p>
              </div>
            </div>
          `,
          width: '600px',
          confirmButtonText: 'Cerrar',
          confirmButtonColor: '#3085d6',
          customClass: {
            container: 'custom-swal-container',
            popup: 'custom-swal-popup',
            content: 'custom-swal-content'
          }
        });
      }
    } catch (err) {
      console.error('Error al obtener detalles:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los detalles del proyecto',
        confirmButtonColor: '#3085d6'
      });
    }
  };

  const handleDelete = async (id) => {
  
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "¡No podrás revertir esta acción!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });
  
    if (result.isConfirmed) {
      try {
        const response = await axiosInstance.delete(`/proyectos/${id}`);
        if (response.data.status === 'success') {
          await Swal.fire({
            icon: 'success',
            title: 'Eliminado',
            text: 'El proyecto ha sido eliminado exitosamente.',
            confirmButtonColor: '#3085d6',
          });
          fetchProyectos(); 
        } else {
          throw new Error(response.data.message || 'Error desconocido');
        }
      } catch (err) {
        console.error('Error al eliminar:', err);
        const errorMessage = err.response?.data?.error || 'Error al eliminar el proyecto';
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorMessage,
          confirmButtonColor: '#3085d6',
        });
      }
    }
  };

  const filteredEstudiantes = estudiantes.filter(estudiante =>
    estudiante.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    estudiante.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    estudiante.projectTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    estudiante.profesorGuia.toLowerCase().includes(searchTerm.toLowerCase()) ||
    estudiante.profesorInformante.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl font-semibold text-gray-600">Cargando proyectos...</div>
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

  const handleFinalize = async (id) => {
    try {
      const { value: nota } = await Swal.fire({
        title: 'Finalizar Proyecto',
        input: 'number',
        inputLabel: 'Ingrese la nota final (1.0 - 7.0)',
        inputPlaceholder: 'Nota',
        showCancelButton: true,
        confirmButtonText: 'Finalizar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#3085d6',
        inputAttributes: {
          min: '1.0',
          max: '7.0',
          step: '0.1'
        },
        inputValidator: (value) => {
          if (!value) {
            return 'Debe ingresar una nota';
          }
          const nota = parseFloat(value);
          if (nota < 1.0 || nota > 7.0) {
            return 'La nota debe estar entre 1.0 y 7.0';
          }
        }
      });
  
      if (nota) {
        const response = await axiosInstance.put(`/proyectos/${id}/finalizar`, {
          nota: parseFloat(nota)
        });
  
        if (response.data.status === 'success') {
          await Swal.fire({
            icon: 'success',
            title: 'Proyecto Finalizado',
            text: 'El proyecto ha sido finalizado exitosamente.',
            confirmButtonColor: '#3085d6'
          });
          
          fetchProyectos();
          
          const result = await Swal.fire({
            title: 'Proyecto finalizado con éxito',
            text: '¿Desea ir a la página de proyectos finalizados?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, ir',
            cancelButtonText: 'No, quedarme aquí'
          });
  
          if (result.isConfirmed) {
            window.location.href = '/proyectosfinalizados';
          }
        }
      }
    } catch (err) {
      console.error('Error al finalizar:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo finalizar el proyecto',
        confirmButtonColor: '#3085d6'
      });
    }
  };
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
            <h2 className="text-2xl font-semibold text-gray-800 mb-8">Proyectos de Título</h2>
            
            <div className="mb-6">
              <input
                type="text"
                placeholder="🔍 Buscar por estudiante, profesor o proyecto..."
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
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEstudiantes.map((estudiante) => (
                    <tr key={estudiante.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {estudiante.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {estudiante.email}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {estudiante.projectTitle}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {estudiante.profesorGuia}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {estudiante.profesorInformante}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                        <button 
                            className="inline-flex items-center px-3 py-1.5 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors duration-200"
                            onClick={() => handleView(estudiante.id)}
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Ver
                        </button>
                          <button 
                            className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors duration-200"
                            onClick={() => navigate(`/EditarProyecto/${estudiante.id}`)}
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Editar
                          </button>
                          <button 
                            className="inline-flex items-center px-3 py-1.5 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors duration-200"
                            onClick={() => handleDelete(estudiante.id)}
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Eliminar
                          </button>
                          <button 
                          className="inline-flex items-center px-3 py-1.5 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors duration-200"
                          onClick={() => handleFinalize(estudiante.id)}
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Finalizar
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
                onClick={() => navigate('/NuevoProyecto')}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                </svg>
                Agregar proyecto de título
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AluTitulos;