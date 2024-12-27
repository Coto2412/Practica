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
            "http://127.0.0.1:5000",  # Variación de localhost para Flask
            ],
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
        
class Estudiante(db.Model):
    __tablename__ = 'estudiantes'
    
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    apellido = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'nombre': self.nombre,
            'apellido': self.apellido,
            'email': self.email
        }

class Profesor(db.Model):
    __tablename__ = 'profesores'
    
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    apellido = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'nombre': self.nombre,
            'apellido': self.apellido,
            'email': self.email
        }

class Proyecto(db.Model):
    __tablename__ = 'proyectos'
    
    id = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(200), nullable=False)
    descripcion = db.Column(db.Text)
    estudiante_id = db.Column(db.Integer, db.ForeignKey('estudiantes.id'), nullable=False)
    profesor_guia_id = db.Column(db.Integer, db.ForeignKey('profesores.id'), nullable=False)
    profesor_informante_id = db.Column(db.Integer, db.ForeignKey('profesores.id'), nullable=False)
    
    # Relaciones
    estudiante = db.relationship('Estudiante', foreign_keys=[estudiante_id])
    profesor_guia = db.relationship('Profesor', foreign_keys=[profesor_guia_id])
    profesor_informante = db.relationship('Profesor', foreign_keys=[profesor_informante_id])

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
        
@app.route('/api/proyectos', methods=['GET'])
def obtener_proyectos():
    try:
        proyectos = Proyecto.query.all()
        
        resultado = []
        for proyecto in proyectos:
            proyecto_info = {
                'id': proyecto.id,  # Se añade el ID real del proyecto
                'estudiante': f"{proyecto.estudiante.nombre} {proyecto.estudiante.apellido}",
                'correo': proyecto.estudiante.email,
                'proyecto_titulo': proyecto.titulo,
                'profesor_guia': f"{proyecto.profesor_guia.nombre} {proyecto.profesor_guia.apellido}",
                'profesor_informante': f"{proyecto.profesor_informante.nombre} {proyecto.profesor_informante.apellido}"
            }
            resultado.append(proyecto_info)
            
        return jsonify({
            'data': resultado,
            'status': 'success'
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500
        
@app.route('/api/proyectos/<int:id>', methods=['GET'])
def obtener_proyecto(id):
    try:
        proyecto = Proyecto.query.get_or_404(id)
        return jsonify({
            'proyecto': {
                'id': proyecto.id,
                'titulo': proyecto.titulo,
                'descripcion': proyecto.descripcion,
                'estudiante_id': proyecto.estudiante_id,
                'profesor_guia_id': proyecto.profesor_guia_id,
                'profesor_informante_id': proyecto.profesor_informante_id
            },
            'status': 'success'
        }), 200
    except Exception as e:
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500
        
@app.route('/api/proyectos', methods=['POST'])
def crear_proyecto():
    try:
        data = request.get_json()
        
        nuevo_proyecto = Proyecto(
            titulo=data['titulo'],
            descripcion=data['descripcion'],
            estudiante_id=data['estudiante_id'],
            profesor_guia_id=data['profesor_guia_id'],
            profesor_informante_id=data['profesor_informante_id']
        )
        
        db.session.add(nuevo_proyecto)
        db.session.commit()
        
        return jsonify({
            'message': 'Proyecto creado exitosamente',
            'status': 'success'
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500
        
@app.route('/api/proyectos/<int:id>', methods=['PUT'])
def actualizar_proyecto(id):
    try:
        proyecto = Proyecto.query.get_or_404(id)
        data = request.get_json()
        
        proyecto.titulo = data['titulo']
        proyecto.descripcion = data['descripcion']
        proyecto.estudiante_id = data['estudiante_id']
        proyecto.profesor_guia_id = data['profesor_guia_id']
        proyecto.profesor_informante_id = data['profesor_informante_id']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Proyecto actualizado exitosamente',
            'status': 'success'
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500
        
@app.route('/api/proyectos/<int:id>', methods=['DELETE'])
def eliminar_proyecto(id):
    try:
        proyecto = Proyecto.query.get_or_404(id)
        
        db.session.delete(proyecto)
        db.session.commit()
        
        return jsonify({
            'message': 'Proyecto eliminado exitosamente',
            'status': 'success'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        error_message = str(e)

        return jsonify({
            'error': f'Error al eliminar el proyecto: {error_message}',
            'status': 'error'
        }), 500
        
@app.route('/api/profesores', methods=['GET'])
def obtener_profesores():
    try:
        profesores = Profesor.query.all()
        
        resultado = []
        for profesor in profesores:
            
            proyectos_guiados = Proyecto.query.filter_by(profesor_guia_id=profesor.id).count()
            proyectos_informados = Proyecto.query.filter_by(profesor_informante_id=profesor.id).count()
            
            profesor_info = {
                'id': profesor.id,
                'nombre': profesor.nombre,
                'apellido': profesor.apellido,
                'email': profesor.email,
                'proyectos_guiados': proyectos_guiados,
                'proyectos_informados': proyectos_informados
            }
            resultado.append(profesor_info)
            
        return jsonify({
            'data': resultado,
            'status': 'success'
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500

@app.route('/api/profesores', methods=['POST'])
def crear_profesor():
    try:
        data = request.get_json()
        
        # Valida campos requeridos
        required_fields = ['nombre', 'apellido', 'email']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'error': f'El campo {field} es requerido',
                    'status': 'error'
                }), 400
        
        # Verifica si el email ya existe
        if Profesor.query.filter_by(email=data['email']).first():
            return jsonify({
                'error': 'El email ya está registrado',
                'status': 'error'
            }), 400
        
        # Crear nuevo profesor
        nuevo_profesor = Profesor(
            nombre=data['nombre'],
            apellido=data['apellido'],
            email=data['email']
        )
        
        db.session.add(nuevo_profesor)
        db.session.commit()
        
        return jsonify({
            'message': 'Profesor creado exitosamente',
            'profesor': nuevo_profesor.to_dict(),
            'status': 'success'
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500
        
@app.route('/api/profesores/<int:id>', methods=['DELETE'])
def eliminar_profesor(id):
    try:
        profesor = Profesor.query.get_or_404(id)
        
        proyectos_guiados = Proyecto.query.filter_by(profesor_guia_id=profesor.id).first()
        proyectos_informados = Proyecto.query.filter_by(profesor_informante_id=profesor.id).first()
        
        if proyectos_guiados or proyectos_informados:
            return jsonify({
                'error': 'No se puede eliminar el profesor porque tiene proyectos asociados',
                'status': 'error'
            }), 400
            
        db.session.delete(profesor)
        db.session.commit()
        
        return jsonify({
            'message': 'Profesor eliminado exitosamente',
            'status': 'success'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500
        
@app.route('/api/profesores/<int:id>', methods=['GET'])
def obtener_profesor(id):
    try:
        profesor = Profesor.query.get_or_404(id)
        return jsonify({
            'profesor': profesor.to_dict(),
            'status': 'success'
        }), 200
    except Exception as e:
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500

@app.route('/api/profesores/<int:id>', methods=['PUT'])
def actualizar_profesor(id):
    try:
        profesor = Profesor.query.get_or_404(id)
        data = request.get_json()
        
        required_fields = ['nombre', 'apellido', 'email']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'error': f'El campo {field} es requerido',
                    'status': 'error'
                }), 400
        
        profesor_existente = Profesor.query.filter_by(email=data['email']).first()
        if profesor_existente and profesor_existente.id != id:
            return jsonify({
                'error': 'El email ya está registrado',
                'status': 'error'
            }), 400
            
        profesor.nombre = data['nombre']
        profesor.apellido = data['apellido']
        profesor.email = data['email']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Profesor actualizado exitosamente',
            'profesor': profesor.to_dict(),
            'status': 'success'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500
        
@app.route('/api/profesores/<int:id>/detalle', methods=['GET'])
def obtener_profesor_detalle(id):
    try:
        profesor = Profesor.query.get_or_404(id)
        
        proyectos_guiados = Proyecto.query.filter_by(profesor_guia_id=profesor.id).all()
        
        proyectos_informados = Proyecto.query.filter_by(profesor_informante_id=profesor.id).all()
        
        proyectos_guiados_data = [{
            'id': p.id,
            'titulo': p.titulo,
            'descripcion': p.descripcion,
            'estudiante': f"{p.estudiante.nombre} {p.estudiante.apellido}",
            'estudiante_email': p.estudiante.email
        } for p in proyectos_guiados]
        
        proyectos_informados_data = [{
            'id': p.id,
            'titulo': p.titulo,
            'descripcion': p.descripcion,
            'estudiante': f"{p.estudiante.nombre} {p.estudiante.apellido}",
            'estudiante_email': p.estudiante.email
        } for p in proyectos_informados]
        
        profesor_detalle = {
            'id': profesor.id,
            'nombre': profesor.nombre,
            'apellido': profesor.apellido,
            'email': profesor.email,
            'proyectos_guiados': proyectos_guiados_data,
            'proyectos_informados': proyectos_informados_data,
            'total_proyectos_guiados': len(proyectos_guiados_data),
            'total_proyectos_informados': len(proyectos_informados_data)
        }
        
        return jsonify({
            'profesor': profesor_detalle,
            'status': 'success'
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500
        
@app.route('/api/estudiantes', methods=['GET'])
def obtener_estudiantes():
    try:
        estudiantes = Estudiante.query.all()
        return jsonify({
            'data': [estudiante.to_dict() for estudiante in estudiantes],
            'status': 'success'
        }), 200
    except Exception as e:
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500
        
@app.route('/api/logout', methods=['POST'])
@jwt_required()
def logout():
    return jsonify({
        'message': 'Sesión cerrada exitosamente',
        'status': 'success'
    }), 200
        
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True)
    
