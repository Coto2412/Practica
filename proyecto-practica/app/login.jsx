export default function Login() {
  return (
    <div className="relative flex items-center justify-center min-h-screen bg-cover bg-center font-roboto" style={{ backgroundImage: "url('/img/uct.png')" }}>
      <div className="bg-sky-400 rounded-3xl p-8 w-96 shadow-xl">
        <div className="text-center">
          <div className="flex items-center gap-2 mb-4">
            <img src="/img/Logo_ing_civil_informatica.png" alt="UCT Logo" className="w-30" />
          </div>
        </div>
        <form className="mt-8">
          <div className="mb-6">
            <label htmlFor="email" className="block text-black text-base mb-2">Correo institucional</label>
            <input
              type="email"
              id="email"
              className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring focus:ring-blue-500"
              placeholder="example@uct.cl"
            />
          </div>
          <div className="mb-8">
            <label htmlFor="password" className="block text-black text-base mb-2">Contraseña</label>
            <input    
              type="password"
              id="password"
              className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring focus:ring-blue-500"
              placeholder="********"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            className="w-full mt-3 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
          >
            Registrarse
          </button>
        </form>
      </div>
    </div>
  );
}