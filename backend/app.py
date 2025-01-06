from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from flask_sqlalchemy import SQLAlchemy
from os import environ
from dotenv import load_dotenv
from datetime import datetime

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
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:5174",  
            "http://127.0.0.1:5174",  
            "http://localhost:5000",
            "http://127.0.0.1:5000"
        ],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "expose_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True,
        "max_age": 3600
    }
})

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

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
    nota = db.Column(db.Float, nullable=True)  
    estado = db.Column(db.String(20), nullable=True) 
    
    # Relaciones
    estudiante = db.relationship('Estudiante', foreign_keys=[estudiante_id])
    profesor_guia = db.relationship('Profesor', foreign_keys=[profesor_guia_id])
    profesor_informante = db.relationship('Profesor', foreign_keys=[profesor_informante_id])
    
class ParticipacionProfesores(db.Model):
    __tablename__ = 'participacion_profesores'
    
    id = db.Column(db.Integer, primary_key=True)
    profesor_id = db.Column(db.Integer, db.ForeignKey('profesores.id'), nullable=False)
    proyecto_id = db.Column(db.Integer, db.ForeignKey('proyectos.id'), nullable=False)
    rol = db.Column(db.String(100), nullable=False)
    fecha_participacion = db.Column(db.Date, nullable=False)
    
    # Relaciones
    profesor = db.relationship('Profesor', foreign_keys=[profesor_id])
    proyecto = db.relationship('Proyecto', foreign_keys=[proyecto_id])
    
    def to_dict(self):
        return {
            'id': self.id,
            'profesor_id': self.profesor_id,
            'proyecto_id': self.proyecto_id,
            'rol': self.rol,
            'fecha_participacion': self.fecha_participacion.isoformat()
        }

class Practica(db.Model):
    __tablename__ = 'practicas'
    
    id = db.Column(db.Integer, primary_key=True)
    estudiante_id = db.Column(db.Integer, db.ForeignKey('estudiantes.id'), nullable=False)
    tipo_practica = db.Column(db.String(100), nullable=False)
    empresa = db.Column(db.String(200), nullable=False)
    fecha_inicio = db.Column(db.Date, nullable=False)
    fecha_termino = db.Column(db.Date, nullable=False)
    supervisor = db.Column(db.String(200), nullable=False)
    contacto_supervisor = db.Column(db.String(200), nullable=False)
    nota = db.Column(db.Float, nullable=True)
    carta_documentacion = db.Column(db.LargeBinary, nullable=True)
    
    # Relación
    estudiante = db.relationship('Estudiante', foreign_keys=[estudiante_id])
    
    def to_dict(self):
        return {
            'id': self.id,
            'estudiante_id': self.estudiante_id,
            'tipo_practica': self.tipo_practica,
            'empresa': self.empresa,
            'fecha_inicio': self.fecha_inicio.isoformat(),
            'fecha_termino': self.fecha_termino.isoformat(),
            'supervisor': self.supervisor,
            'contacto_supervisor': self.contacto_supervisor,
            'nota': self.nota
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
        
        # Crea nueva secretaria
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
        
        # Verifica que se proporcionaron email y contraseña
        if not data or 'email' not in data or 'contrasena' not in data:
            return jsonify({
                'error': 'Email y contraseña son requeridos',
                'status': 'error'
            }), 400
        
        # Busca la secretaria por email
        secretaria = Secretaria.query.filter_by(email=data['email']).first()
        
        # Verifica si existe la secretaria y si la contraseña es correcta
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
        proyectos = Proyecto.query.filter(Proyecto.nota.is_(None)).all()
        
        resultado = []
        for proyecto in proyectos:
            proyecto_info = {
                'id': proyecto.id,
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
@jwt_required()
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
@jwt_required()
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
@jwt_required()
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
        
@app.route('/api/proyectos/<int:id>/finalizar', methods=['PUT'])
@jwt_required()
def finalizar_proyecto(id):
    try:
        proyecto = Proyecto.query.get_or_404(id)
        data = request.get_json()
        
        if 'nota' not in data:
            return jsonify({
                'error': 'La nota es requerida',
                'status': 'error'
            }), 400
            
        proyecto.nota = float(data['nota'])
        proyecto.estado = 'Aprobado' if proyecto.nota >= 4.0 else 'Reprobado'
        
        db.session.commit()
        
        return jsonify({
            'message': 'Proyecto finalizado exitosamente',
            'status': 'success'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500
        
@app.route('/api/proyectos/finalizados', methods=['GET'])
def obtener_proyectos_finalizados():
    try:
        proyectos = Proyecto.query.filter(Proyecto.nota.isnot(None)).all()
        
        resultado = []
        for proyecto in proyectos:
            proyecto_info = {
                'id': proyecto.id,
                'estudiante': f"{proyecto.estudiante.nombre} {proyecto.estudiante.apellido}",
                'correo': proyecto.estudiante.email,
                'proyecto_titulo': proyecto.titulo,
                'profesor_guia': f"{proyecto.profesor_guia.nombre} {proyecto.profesor_guia.apellido}",
                'profesor_informante': f"{proyecto.profesor_informante.nombre} {proyecto.profesor_informante.apellido}",
                'nota': proyecto.nota,
                'estado': proyecto.estado
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
        
@app.route('/api/profesores', methods=['GET'])
@jwt_required()
def obtener_profesores():
    try:
        profesores = Profesor.query.all()
        
        resultado = []
        for profesor in profesores:
            proyectos_guiados = Proyecto.query.filter_by(profesor_guia_id=profesor.id)\
                                            .filter(Proyecto.nota.is_(None))\
                                            .count()
            
            proyectos_informados = Proyecto.query.filter_by(profesor_informante_id=profesor.id)\
                                               .filter(Proyecto.nota.is_(None))\
                                               .count()
            
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
@jwt_required()
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
@jwt_required()
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
@jwt_required()
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
        
        proyectos_guiados = Proyecto.query.filter_by(profesor_guia_id=profesor.id)\
                                        .filter(Proyecto.nota.is_(None))\
                                        .all()
        
        proyectos_informados = Proyecto.query.filter_by(profesor_informante_id=profesor.id)\
                                           .filter(Proyecto.nota.is_(None))\
                                           .all()
        
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

@app.route('/api/practicas/inicial', methods=['GET'])
def obtener_practicas_iniciales():
    try:
        practicas = Practica.query.filter(Practica.tipo_practica.ilike('inicial')).all()
        
        resultado = []
        for practica in practicas:
            practica_info = {
                'id': practica.id,
                'estudiante': f"{practica.estudiante.nombre} {practica.estudiante.apellido}",
                'estudiante_email': practica.estudiante.email,
                'empresa': practica.empresa,
                'fecha_inicio': practica.fecha_inicio.strftime('%Y-%m-%d'),
                'fecha_termino': practica.fecha_termino.strftime('%Y-%m-%d'),
                'supervisor': practica.supervisor,
                'contacto_supervisor': practica.contacto_supervisor,
                'nota': practica.nota if practica.nota else None
            }
            resultado.append(practica_info)
            
        return jsonify({
            'data': resultado,
            'status': 'success'
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500
        
@app.route('/api/practicas/inicial', methods=['POST'])
@jwt_required()
def crear_practica_inicial():
    try:
        data = request.get_json()
        
        # Validar campos requeridos
        required_fields = ['estudiante_id', 'empresa', 'fecha_inicio', 
                         'fecha_termino', 'supervisor', 'contacto_supervisor']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'error': f'El campo {field} es requerido',
                    'status': 'error'
                }), 400
        
        # Convertir fechas de string a objeto datetime
        try:
            fecha_inicio = datetime.strptime(data['fecha_inicio'], '%Y-%m-%d')
            fecha_termino = datetime.strptime(data['fecha_termino'], '%Y-%m-%d')
        except ValueError:
            return jsonify({
                'error': 'Formato de fecha inválido',
                'status': 'error'
            }), 400
            
        # Validar que el estudiante existe
        estudiante = Estudiante.query.get(data['estudiante_id'])
        if not estudiante:
            return jsonify({
                'error': 'El estudiante no existe',
                'status': 'error'
            }), 404
            
        # Verificar si el estudiante ya tiene una práctica inicial
        practica_existente = Practica.query.filter_by(
            estudiante_id=data['estudiante_id'],
            tipo_practica='Inicial'  # Cambiado a mayúscula
        ).first()
        
        if practica_existente:
            return jsonify({
                'error': 'El estudiante ya tiene una práctica inicial registrada',
                'status': 'error'
            }), 400

        # Crear nueva práctica
        nueva_practica = Practica(
            estudiante_id=data['estudiante_id'],
            tipo_practica='Inicial',  # Cambiado a mayúscula
            empresa=data['empresa'],
            fecha_inicio=fecha_inicio,
            fecha_termino=fecha_termino,
            supervisor=data['supervisor'],
            contacto_supervisor=data['contacto_supervisor']
        )
        
        db.session.add(nueva_practica)
        db.session.commit()
        
        return jsonify({
            'message': 'Práctica inicial creada exitosamente',
            'practica': nueva_practica.to_dict(),
            'status': 'success'
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500
        
        
@app.route('/api/practicas/<int:id>', methods=['PUT'])
@jwt_required()
def actualizar_practica(id):
    try:
        practica = Practica.query.get_or_404(id)
        data = request.get_json()
        
        # Si la nota viene como None o vacía, la establecemos como None
        if 'nota' in data:
            if data['nota'] is None or data['nota'] == '':
                practica.nota = None
            else:
                nota = float(data['nota'])
                if nota < 1.0 or nota > 7.0:
                    return jsonify({
                        'error': 'La nota debe estar entre 1.0 y 7.0',
                        'status': 'error'
                    }), 400
                practica.nota = nota

        practica.empresa = data.get('empresa', practica.empresa)
        practica.fecha_inicio = data.get('fecha_inicio', practica.fecha_inicio)
        practica.fecha_termino = data.get('fecha_termino', practica.fecha_termino)
        practica.supervisor = data.get('supervisor', practica.supervisor)
        practica.contacto_supervisor = data.get('contacto_supervisor', practica.contacto_supervisor)
        
        db.session.commit()
        return jsonify({'message': 'Práctica actualizada exitosamente', 'status': 'success'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e), 'status': 'error'}), 500

@app.route('/api/practicas/<int:id>', methods=['DELETE'])
@jwt_required()
def eliminar_practica(id):
    try:
        practica = Practica.query.get_or_404(id)
        db.session.delete(practica)
        db.session.commit()
        return jsonify({'message': 'Práctica eliminada exitosamente', 'status': 'success'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e), 'status': 'error'}), 500
    
@app.route('/api/practicas/profesional', methods=['GET'])
def obtener_practicas_profesionales():
    try:
        practicas = Practica.query.filter(Practica.tipo_practica.ilike('profesional')).all()
        
        resultado = []
        for practica in practicas:
            practica_info = {
                'id': practica.id,
                'estudiante': f"{practica.estudiante.nombre} {practica.estudiante.apellido}",
                'estudiante_email': practica.estudiante.email,
                'empresa': practica.empresa,
                'fecha_inicio': practica.fecha_inicio.strftime('%Y-%m-%d'),
                'fecha_termino': practica.fecha_termino.strftime('%Y-%m-%d'),
                'supervisor': practica.supervisor,
                'contacto_supervisor': practica.contacto_supervisor,
                'nota': practica.nota if practica.nota else None
            }
            resultado.append(practica_info)
            
        return jsonify({
            'data': resultado,
            'status': 'success'
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500
        
@app.route('/api/practicas/profesional/<int:id>', methods=['PUT'])
@jwt_required()
def actualizar_practica_profesional(id):
    try:
        practica = Practica.query.get_or_404(id)
        data = request.get_json()
        
        # Si la nota viene como None, vacía o se quiere eliminar, la establecemos como None
        if 'nota' in data:
            if data['nota'] is None or data['nota'] == '':
                practica.nota = None
            else:
                nota = float(data['nota'])
                if nota < 1.0 or nota > 7.0:
                    return jsonify({
                        'error': 'La nota debe estar entre 1.0 y 7.0',
                        'status': 'error'
                    }), 400
                practica.nota = nota

        # Actualizar fechas si se proporcionan
        if 'fecha_inicio' in data and data['fecha_inicio']:
            try:
                practica.fecha_inicio = datetime.strptime(data['fecha_inicio'], '%Y-%m-%d')
            except ValueError:
                return jsonify({
                    'error': 'Formato de fecha inválido para fecha_inicio',
                    'status': 'error'
                }), 400
                
        if 'fecha_termino' in data and data['fecha_termino']:
            try:
                practica.fecha_termino = datetime.strptime(data['fecha_termino'], '%Y-%m-%d')
            except ValueError:
                return jsonify({
                    'error': 'Formato de fecha inválido para fecha_termino',
                    'status': 'error'
                }), 400
        
        practica.empresa = data.get('empresa', practica.empresa)
        practica.supervisor = data.get('supervisor', practica.supervisor)
        practica.contacto_supervisor = data.get('contacto_supervisor', practica.contacto_supervisor)
        
        db.session.commit()
        return jsonify({
            'message': 'Práctica profesional actualizada exitosamente',
            'status': 'success'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500
        
@app.route('/api/practicas/profesional', methods=['POST'])
@jwt_required()
def crear_practica_profesional():
    try:
        data = request.get_json()
        
        # Validar campos requeridos
        required_fields = ['estudiante_id', 'empresa', 'fecha_inicio', 
                         'fecha_termino', 'supervisor', 'contacto_supervisor']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'error': f'El campo {field} es requerido',
                    'status': 'error'
                }), 400
        
        # Convertir fechas de string a objeto datetime
        try:
            fecha_inicio = datetime.strptime(data['fecha_inicio'], '%Y-%m-%d')
            fecha_termino = datetime.strptime(data['fecha_termino'], '%Y-%m-%d')
        except ValueError:
            return jsonify({
                'error': 'Formato de fecha inválido',
                'status': 'error'
            }), 400
            
        # Validar que el estudiante existe
        estudiante = Estudiante.query.get(data['estudiante_id'])
        if not estudiante:
            return jsonify({
                'error': 'El estudiante no existe',
                'status': 'error'
            }), 404
            
        # Verificar si el estudiante ya tiene una práctica profesional
        practica_existente = Practica.query.filter_by(
            estudiante_id=data['estudiante_id'],
            tipo_practica='Profesional'
        ).first()
        
        if practica_existente:
            return jsonify({
                'error': 'El estudiante ya tiene una práctica profesional registrada',
                'status': 'error'
            }), 400

        # Crear nueva práctica
        nueva_practica = Practica(
            estudiante_id=data['estudiante_id'],
            tipo_practica='Profesional',
            empresa=data['empresa'],
            fecha_inicio=fecha_inicio,
            fecha_termino=fecha_termino,
            supervisor=data['supervisor'],
            contacto_supervisor=data['contacto_supervisor']
        )
        
        db.session.add(nueva_practica)
        db.session.commit()
        
        return jsonify({
            'message': 'Práctica profesional creada exitosamente',
            'practica': nueva_practica.to_dict(),
            'status': 'success'
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500
        
@app.route('/api/practicas/profesional/<int:id>', methods=['DELETE'])
@jwt_required()
def eliminar_practica_profesional(id):
    try:
        practica = Practica.query.get_or_404(id)
        db.session.delete(practica)
        db.session.commit()
        
        return jsonify({
            'message': 'Práctica profesional eliminada exitosamente',
            'status': 'success'
        }), 200
        
    except Exception as e:
        db.session.rollback()
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
    
