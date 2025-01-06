import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/navbar';
import Swal from 'sweetalert2';
import axiosInstance from '../config/axiosConfig';

const EditarProyecto = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    estudiante_id: '',
    profesor_guia_id: '',
    profesor_informante_id: ''
  });

  const [estudiantes, setEstudiantes] = useState([]);
  const [profesores, setProfesores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [proyectoRes, estudiantesRes, profesoresRes] = await Promise.all([
          axiosInstance.get(`http://localhost:5000/api/proyectos/${id}`),
          axiosInstance.get('http://localhost:5000/api/estudiantes'),
          axiosInstance.get('http://localhost:5000/api/profesores')
        ]);

        if (proyectoRes.data.status === 'success') {
          setFormData({
            titulo: proyectoRes.data.proyecto.titulo,
            descripcion: proyectoRes.data.proyecto.descripcion,
            estudiante_id: proyectoRes.data.proyecto.estudiante_id,
            profesor_guia_id: proyectoRes.data.proyecto.profesor_guia_id,
            profesor_informante_id: proyectoRes.data.proyecto.profesor_informante_id
          });
        }

        if (estudiantesRes.data.status === 'success') {
          setEstudiantes(estudiantesRes.data.data);
        }
        if (profesoresRes.data.status === 'success') {
          setProfesores(profesoresRes.data.data);
        }
      } catch (err) {
        setError('Error al cargar los datos');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.put(`http://localhost:5000/api/proyectos/${id}`, formData);
      if (response.data.status === 'success') {
        await Swal.fire({
          title: '¡Éxito!',
          text: 'Proyecto actualizado exitosamente',
          icon: 'success',
          confirmButtonText: 'Aceptar'
        });
        navigate('/ProyectosTitulo');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Error al actualizar el proyecto';
      Swal.fire({
        title: 'Error',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl font-semibold text-gray-600">Cargando...</div>
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
          backgroundPosition: 'center'
        }}
      >
        <div className="max-w-3xl mx-auto px-4 py-16">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-xl p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Editar Proyecto de Título</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título del Proyecto
                </label>
                <input
                  type="text"
                  name="titulo"
                  required
                  value={formData.titulo}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  name="descripcion"
                  required
                  value={formData.descripcion}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estudiante
                </label>
                <select
                  name="estudiante_id"
                  required
                  value={formData.estudiante_id}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Seleccione un estudiante</option>
                  {estudiantes.map((estudiante) => (
                    <option key={estudiante.id} value={estudiante.id}>
                      {estudiante.nombre} {estudiante.apellido}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profesor Guía
                </label>
                <select
                  name="profesor_guia_id"
                  required
                  value={formData.profesor_guia_id}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Seleccione un profesor guía</option>
                  {profesores.map((profesor) => (
                    <option key={profesor.id} value={profesor.id}>
                      {profesor.nombre} {profesor.apellido}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profesor Informante
                </label>
                <select
                  name="profesor_informante_id"
                  required
                  value={formData.profesor_informante_id}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Seleccione un profesor informante</option>
                  {profesores.map((profesor) => (
                    <option key={profesor.id} value={profesor.id}>
                      {profesor.nombre} {profesor.apellido}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => navigate('/ProyectosTitulo')}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditarProyecto;
