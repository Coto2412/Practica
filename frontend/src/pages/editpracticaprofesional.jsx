import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/navbar';
import Swal from 'sweetalert2';
import axiosInstance from '../config/axiosConfig';

const EditPracticaProfesional = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    estudiante: '',
    estudiante_email: '',
    empresa: '',
    fecha_inicio: '',
    fecha_termino: '',
    supervisor: '',
    contacto_supervisor: '',
    nota: ''
  });
  const [documentos, setDocumentos] = useState({
    carta_supervisor: null,
    certificado_alumno: null,
    formulario_inscripcion: null,
    autorizacion_empresa: null
  });
  const [documentosActuales, setDocumentosActuales] = useState({
    carta_supervisor: null,
    certificado_alumno: null,
    formulario_inscripcion: null,
    autorizacion_empresa: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const DOCUMENT_LABELS = {
    carta_supervisor: 'Carta del Supervisor',
    certificado_alumno: 'Certificado del Alumno',
    formulario_inscripcion: 'Formulario de Inscripción',
    autorizacion_empresa: 'Autorización de la Empresa'
  };

  useEffect(() => {
    const fetchPractica = async () => {
      try {
        const response = await axiosInstance.get(`http://localhost:5000/api/practicas/profesional/${id}`);
        if (response.data.status === 'success') {
          const practica = response.data.data;
          setFormData({
            estudiante: practica.estudiante,
            estudiante_email: practica.estudiante_email,
            empresa: practica.empresa,
            fecha_inicio: practica.fecha_inicio,
            fecha_termino: practica.fecha_termino,
            supervisor: practica.supervisor,
            contacto_supervisor: practica.contacto_supervisor,
            nota: practica.nota || ''
          });
          
          setDocumentosActuales({
            carta_supervisor: practica.carta_supervisor,
            certificado_alumno: practica.certificado_alumno,
            formulario_inscripcion: practica.formulario_inscripcion,
            autorizacion_empresa: practica.autorizacion_empresa
          });
        }
      } catch (err) {
        setError('Error al cargar los datos de la práctica');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPractica();
  }, [id]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Actualizar datos básicos
      const response = await axiosInstance.put(`http://localhost:5000/api/practicas/profesional/${id}`, {
        empresa: formData.empresa,
        fecha_inicio: formData.fecha_inicio,
        fecha_termino: formData.fecha_termino,
        supervisor: formData.supervisor,
        contacto_supervisor: formData.contacto_supervisor,
        nota: formData.nota ? parseFloat(formData.nota) : null
      });

      // Subir nuevos documentos
      const uploadPromises = Object.entries(documentos)
        .filter(([_, file]) => file !== null)
        .map(async ([tipo, file]) => {
          const formData = new FormData();
          formData.append('file', file);
          return axiosInstance.post(
            `http://localhost:5000/api/documentos/subir/${tipo}/${id}`,
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            }
          );
        });

      await Promise.all(uploadPromises);

      if (response.data.status === 'success') {
        await Swal.fire({
          title: '¡Éxito!',
          text: 'Práctica profesional actualizada exitosamente',
          icon: 'success',
          confirmButtonText: 'Aceptar'
        });
        navigate('/PracticaProfesional');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Error al actualizar la práctica';
      Swal.fire({
        title: 'Error',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-xl font-semibold text-gray-600">Cargando...</div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-xl font-semibold text-red-600">{error}</div>
    </div>
  );

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
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Editar Práctica Profesional</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Campos de datos básicos sin cambios */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estudiante
                </label>
                <input
                  type="text"
                  name="estudiante"
                  value={formData.estudiante}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email del Estudiante
                </label>
                <input
                  type="email"
                  name="estudiante_email"
                  value={formData.estudiante_email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Empresa
                </label>
                <input
                  type="text"
                  name="empresa"
                  value={formData.empresa}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
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
                    value={formData.fecha_inicio}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Término
                  </label>
                  <input
                    type="date"
                    name="fecha_termino"
                    value={formData.fecha_termino}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
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
                  value={formData.supervisor}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contacto del Supervisor
                </label>
                <input
                  type="text"
                  name="contacto_supervisor"
                  value={formData.contacto_supervisor}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nota
                </label>
                <input
                  type="number"
                  name="nota"
                  value={formData.nota}
                  onChange={handleChange}
                  min="1"
                  max="7"
                  step="0.1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Sección de documentos simplificada */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Documentos</h3>
                
                {Object.entries(DOCUMENT_LABELS).map(([tipo, label]) => (
                  <div key={tipo} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {label}
                    </label>
                    <div className="space-y-2">
                      {documentosActuales[tipo] && (
                        <div className="text-sm text-gray-600 mb-2">
                          Documento actual: {documentosActuales[tipo].split('/').pop()}
                        </div>
                      )}
                      <input
                        type="file"
                        name={tipo}
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                ))}
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

export default EditPracticaProfesional;