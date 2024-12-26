from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
from os import environ

load_dotenv()
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = environ.get('DB_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

app.secret_key = 'infuct1234'  
app.config['JWT_SECRET_KEY'] = 'infuctsecret24'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 24 * 60 * 60
jwt = JWTManager(app)

CORS(app, resources={
    r"/api/*": {
        "origins": [
            "http://localhost:5173",  # Frontend en React + vite
            "http://127.0.0.1:5173",  # Variación de localhost para React
            "http://localhost:5000",  # Backend local
            "http://127.0.0.1:5000",
            ], # Ajusta esto según la URL de tu frontend
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

class Secretaria(db.Model):
    __tablename__ = 'secretarias'
    
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    apellido = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    contrasena = db.Column(db.String(255), nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'nombre': self.nombre,
            'apellido': self.apellido,
            'email': self.email
        }

@app.route('/api/registro/secretaria', methods=['POST'])
def registrar_secretaria():
    try:
        data = request.get_json()
        
        required_fields = ['nombre', 'apellido', 'email', 'contrasena']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'error': f'El campo {field} es requerido',
                    'status': 'error'
                }), 400
        
        
        if Secretaria.query.filter_by(email=data['email']).first():
            return jsonify({
                'error': 'El email ya está registrado',
                'status': 'error'
            }), 400
        
        # Crear nueva secretaria
        nueva_secretaria = Secretaria(
            nombre=data['nombre'],
            apellido=data['apellido'],
            email=data['email'],
            contrasena=generate_password_hash(data['contrasena'])
        )
        
        db.session.add(nueva_secretaria)
        db.session.commit()
        
        access_token = create_access_token(identity=nueva_secretaria.id)
        
        return jsonify({
            'message': 'Secretaria registrada exitosamente',
            'secretaria': nueva_secretaria.to_dict(),
            'access_token': access_token,
            'status': 'success'
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500
        
@app.route('/api/login/secretaria', methods=['POST'])
def login_secretaria():
    try:
        data = request.get_json()
        
        # Verificar que se proporcionaron email y contraseña
        if not data or 'email' not in data or 'contrasena' not in data:
            return jsonify({
                'error': 'Email y contraseña son requeridos',
                'status': 'error'
            }), 400
        
        # Buscar la secretaria por email
        secretaria = Secretaria.query.filter_by(email=data['email']).first()
        
        # Verificar si existe la secretaria y si la contraseña es correcta
        if not secretaria or not check_password_hash(secretaria.contrasena, data['contrasena']):
            return jsonify({
                'error': 'Credenciales inválidas',
                'status': 'error'
            }), 401
        
        # Generar token JWT
        access_token = create_access_token(identity=secretaria.id)
        
        # Devolver respuesta exitosa
        return jsonify({
            'message': 'Inicio de sesión exitoso',
            'secretaria': secretaria.to_dict(),
            'access_token': access_token,
            'status': 'success'
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500
        
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True)
    
