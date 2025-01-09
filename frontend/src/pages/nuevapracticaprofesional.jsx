import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/navbar';
import Swal from 'sweetalert2';
import axiosInstance from '../config/axiosConfig';

const NuevaPracticaProfesional = () => {
  const navigate = useNavigate();
  const [estudiantes, setEstudiantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    estudiante_id: '',
    tipo_practica: 'Profesional',
    empresa: '',
    fecha_inicio: '',
    fecha_termino: '',
    supervisor: '',
    contacto_supervisor: '',
    carta_supervisor: '',
    certificado_alumno: '',
    formulario_inscripcion: '',
    autorizacion_empresa: ''
  });
  
  // Estado para los archivos
  const [documentos, setDocumentos] = useState({
    carta_supervisor: null,
    certificado_alumno: null,
    formulario_inscripcion: null,
    autorizacion_empresa: null
  });

  useEffect(() => {
    const fetchEstudiantes = async () => {
      try {
        const response = await axiosInstance.get('http://localhost:5000/api/estudiantes');
        if (response.data.status === 'success') {
          setEstudiantes(response.data.data);
        }
      } catch (err) {
        setError('Error al cargar los estudiantes');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEstudiantes();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setDocumentos({
      ...documentos,
      [name]: files[0]
    });
  };

  const uploadDocuments = async (practicaId) => {
    const uploadResults = [];
  
    for (const [tipo, archivo] of Object.entries(documentos)) {
      if (archivo) {
        const formData = new FormData();
        formData.append('file', archivo);
  
        try {
          const response = await axiosInstance.post(
            `http://localhost:5000/api/documentos/subir/${tipo}/${practicaId}`,
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            }
          );
          
          if (response.data.status === 'success') {
            uploadResults.push({
              tipo,
              filepath: response.data.filepath
            });
            
            // Actualizar el formData con la ruta del documento
            setFormData(prevData => ({
              ...prevData,
              [tipo]: response.data.filepath
            }));
          }
        } catch (error) {
          console.error(`Error al subir ${tipo}: ${error.message}`);
          throw error; // Propagar el error para manejarlo en handleSubmit
        }
      }
    }
    
    return uploadResults;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Primero crear la práctica profesional
      const practicaResponse = await axiosInstance.post('http://localhost:5000/api/practicas/profesional', formData);
      
      if (practicaResponse.data.status === 'success') {
        const practicaId = practicaResponse.data.practica.id;
        const hasDocuments = Object.values(documentos).some(doc => doc !== null);
        
        if (hasDocuments) {
          try {
            // Subir los documentos
            const uploadResults = await uploadDocuments(practicaId);
            
            // Crear objeto con las rutas de los documentos
            const documentUpdates = {};
            uploadResults.forEach(result => {
              documentUpdates[result.tipo] = result.filepath;
            });
            
            // Actualizar la práctica con las rutas de los documentos
            const updateResponse = await axiosInstance.put(
              `http://localhost:5000/api/practicas/${practicaId}`,
              {
                ...practicaResponse.data.practica,
                ...documentUpdates
              }
            );
            
            if (updateResponse.data.status !== 'success') {
              throw new Error('Error al actualizar la práctica con los documentos');
            }
            
          } catch (docError) {
            console.error('Error al subir documentos:', docError);
            Swal.fire({
              title: 'Advertencia',
              text: 'La práctica se creó pero hubo problemas con algunos documentos.',
              icon: 'warning'
            });
            return;
          }
        }
        
        // Mostrar mensaje de éxito y redireccionar
        Swal.fire({
          title: '¡Éxito!',
          text: 'Práctica profesional creada exitosamente',
          icon: 'success',
        }).then(() => {
          navigate('/PracticaProfesional');
        });
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Error al crear la práctica profesional';
      Swal.fire({
        title: 'Error',
        text: errorMessage,
        icon: 'error'
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
      <div className="min-h-screen bg-gray-100 py-10"
        style={{
          backgroundImage: 'url("/img/uct.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="max-w-3xl mx-auto px-4 py-16">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-xl p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Nueva Práctica Profesional</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
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
                  Empresa
                </label>
                <input
                  type="text"
                  name="empresa"
                  required
                  value={formData.empresa}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Inicio
                  </label>
                  <input
                    type="date"
                    name="fecha_inicio"
                    required
                    value={formData.fecha_inicio}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Término
                  </label>
                  <input
                    type="date"
                    name="fecha_termino"
                    required
                    value={formData.fecha_termino}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Supervisor
                </label>
                <input
                  type="text"
                  name="supervisor"
                  required
                  value={formData.supervisor}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contacto del Supervisor
                </label>
                <input
                  type="text"
                  name="contacto_supervisor"
                  required
                  value={formData.contacto_supervisor}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Campos para documentos */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Documentos Requeridos</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Carta del Supervisor (PDF)
                  </label>
                  <input
                    type="file"
                    name="carta_supervisor"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Certificado del Alumno (PDF)
                  </label>
                  <input
                    type="file"
                    name="certificado_alumno"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Formulario de Inscripción (PDF)
                  </label>
                  <input
                    type="file"
                    name="formulario_inscripcion"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Autorización de la Empresa (PDF)
                  </label>
                  <input
                    type="file"
                    name="autorizacion_empresa"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => navigate('/PracticaProfesional')}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Guardar Práctica
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NuevaPracticaProfesional;