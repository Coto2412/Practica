from flask import Blueprint, jsonify, request
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required
from models.secretaria import Secretaria
from app import db

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/registro/secretaria', methods=['POST'])
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

@auth_bp.route('/login/secretaria', methods=['POST'])
def login_secretaria():
    try:
        data = request.get_json()
        
        if not data or 'email' not in data or 'contrasena' not in data:
            return jsonify({
                'error': 'Email y contraseña son requeridos',
                'status': 'error'
            }), 400
        
        secretaria = Secretaria.query.filter_by(email=data['email']).first()
        
        if not secretaria or not check_password_hash(secretaria.contrasena, data['contrasena']):
            return jsonify({
                'error': 'Credenciales inválidas',
                'status': 'error'
            }), 401
        
        access_token = create_access_token(identity=secretaria.id)
        
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

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    return jsonify({
        'message': 'Sesión cerrada exitosamente',
        'status': 'success'
    }), 200