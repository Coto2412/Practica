import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import Swal from 'sweetalert2';

const PracticaAcordeon = ({ practicas, handleDelete, fetchPracticas, axiosInstance, API_URL }) => {
  const navigate = useNavigate();
  const [openYears, setOpenYears] = useState(new Set());
  const [openSemesters, setOpenSemesters] = useState(new Set());
  const [openMonths, setOpenMonths] = useState(new Set());

  const groupedPracticas = useMemo(() => {
    const groups = {};
    
    practicas.forEach(practica => {
      const startDate = new Date(practica.fecha_inicio);
      const year = startDate.getFullYear();
      const month = startDate.getMonth();
      const semester = month < 6 ? 1 : 2;
      
      if (!groups[year]) {
        groups[year] = { 1: {}, 2: {} };
      }
      
      if (!groups[year][semester][month]) {
        groups[year][semester][month] = [];
      }
      
      groups[year][semester][month].push(practica);
    });
    
    return groups;
  }, [practicas]);

  const toggleYear = (year) => {
    setOpenYears(prev => {
      const newSet = new Set(prev);
      if (newSet.has(year)) newSet.delete(year);
      else newSet.add(year);
      return newSet;
    });
  };

  const toggleSemester = (yearSemester) => {
    setOpenSemesters(prev => {
      const newSet = new Set(prev);
      if (newSet.has(yearSemester)) newSet.delete(yearSemester);
      else newSet.add(yearSemester);
      return newSet;
    });
  };

  const toggleMonth = (yearSemesterMonth) => {
    setOpenMonths(prev => {
      const newSet = new Set(prev);
      if (newSet.has(yearSemesterMonth)) newSet.delete(yearSemesterMonth);
      else newSet.add(yearSemesterMonth);
      return newSet;
    });
  };

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  return (
    <div className="space-y-4">
      {Object.entries(groupedPracticas)
        .sort(([yearA], [yearB]) => Number(yearB) - Number(yearA))
        .map(([year, semesters]) => (
          <div key={year} className="border rounded-lg overflow-hidden bg-white/90 shadow-lg">
            <button
              className="w-full p-4 bg-blue-200 hover:bg-blue-300 flex justify-between items-center transition-colors duration-200"
              onClick={() => toggleYear(year)}
            >
              <span className="font-semibold text-lg text-gray-700">Año {year}</span>
              <span className="transform transition-transform duration-200">
                {openYears.has(year) ? '▼' : '▶'}
              </span>
            </button>
            
            {openYears.has(year) && (
              <div className="pl-4">
                {Object.entries(semesters).map(([semester, months]) => {
                  const yearSemester = `${year}-${semester}`;
                  return Object.keys(months).length > 0 ? (
                    <div key={semester} className="border-l border-gray-200">
                      <button
                        className="w-full p-3 bg-blue-100 hover:bg-blue-100 flex justify-between items-center transition-colors duration-200"
                        onClick={() => toggleSemester(yearSemester)}
                      >
                        <span className="font-medium text-gray-700">Semestre {semester}</span>
                        <span className="transform transition-transform duration-200 mr-4">
                          {openSemesters.has(yearSemester) ? '▼' : '▶'}
                        </span>
                      </button>
                      
                      {openSemesters.has(yearSemester) && (
                        <div className="pl-4">
                          {Object.entries(months)
                            .sort(([monthA], [monthB]) => Number(monthA) - Number(monthB))
                            .map(([month, practicasMonth]) => {
                              const yearSemesterMonth = `${year}-${semester}-${month}`;
                              return (
                                <div key={month} className="border-l border-gray-200">
                                  <button
                                    className="w-full p-2 bg-green-50 hover:bg-green-100 flex justify-between items-center transition-colors duration-200"
                                    onClick={() => toggleMonth(yearSemesterMonth)}
                                  >
                                    <span className="text-gray-600 font-medium">{monthNames[Number(month)]}</span>
                                    <span className="transform transition-transform duration-200 mr-4">
                                      {openMonths.has(yearSemesterMonth) ? '▼' : '▶'}
                                    </span>
                                  </button>
                                  
                                  {openMonths.has(yearSemesterMonth) && (
                                    <div className="pl-4 py-2 overflow-x-auto">
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
                                          {practicasMonth.map((practica) => (
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
                                                )}
                                              </td>
                                              <td className="px-6 py-4 text-sm">
                                                <div className="flex justify-center space-x-2">
                                                  <button 
                                                    className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors duration-200"
                                                    onClick={() => navigate(`/EditarPractica/${practica.id}`)}
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
                                                </div>
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </div>
                  ) : null;
                })}
              </div>
            )}
          </div>
        ))}
    </div>
  );
};

PracticaAcordeon.propTypes = {
  practicas: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      estudiante: PropTypes.string.isRequired,
      estudiante_email: PropTypes.string.isRequired,
      empresa: PropTypes.string.isRequired,
      fecha_inicio: PropTypes.string.isRequired,
      fecha_termino: PropTypes.string.isRequired,
      supervisor: PropTypes.string.isRequired,
      contacto_supervisor: PropTypes.string.isRequired,
      nota: PropTypes.number
    })
  ).isRequired,
  handleDelete: PropTypes.func.isRequired,
  fetchPracticas: PropTypes.func.isRequired,
  axiosInstance: PropTypes.shape({
    put: PropTypes.func.isRequired,
    delete: PropTypes.func.isRequired,
    get: PropTypes.func.isRequired
  }).isRequired,
  API_URL: PropTypes.string.isRequired
};

export default PracticaAcordeon;