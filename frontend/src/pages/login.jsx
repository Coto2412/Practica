import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/login/secretaria', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          contrasena: formData.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('userData', JSON.stringify(data.secretaria));
        
        navigate('/ProyectosTitulo');
      } else {
        setError(data.error || 'Error al iniciar sesión');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    navigate('/registro');
  };

  return (
    <div
      className="relative flex items-center justify-center min-h-screen bg-cover bg-center font-roboto"
      style={{ backgroundImage: "url('/img/uct.png')" }}
    >
      <div className="bg-sky-400 rounded-3xl p-8 w-96 shadow-xl">
        <div className="text-center">
          <div className="flex items-center gap-2 mb-4">
            <img
              src="/img/Logo_ing_civil_informatica.png"
              alt="UCT Logo"
              className="w-30"
            />
          </div>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded" role="alert">
            {error}
          </div>
        )}

        <form className="mt-8" onSubmit={handleSubmit} noValidate>
          <div className="mb-6">
            <label
              htmlFor="email"
              className="block text-black text-base mb-2"
            >
              Correo institucional
            </label>
            <input
              type="email"
              id="email"
              name="email"
              autoComplete="username"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring focus:ring-blue-500"
              placeholder="example@uct.cl"
              required
            />
          </div>
          <div className="mb-8">
            <label
              htmlFor="password"
              className="block text-black text-base mb-2"
            >
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              name="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring focus:ring-blue-500"
              placeholder="***********"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
          <button
            type="button"
            onClick={handleRegister}
            disabled={loading}
            className="w-full mt-3 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
          >
            Registrarse
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;