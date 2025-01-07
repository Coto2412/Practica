from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from models.practica import Practica
from models.estudiante import Estudiante
from datetime import datetime
from app import db

practicas_bp = Blueprint('practicas', __name__)

@practicas_bp.route('/practicas/inicial', methods=['GET'])
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

@practicas_bp.route('/practicas/inicial', methods=['POST'])
@jwt_required()
def crear_practica_inicial():
    try:
        data = request.get_json()
        
        required_fields = ['estudiante_id', 'empresa', 'fecha_inicio', 
                         'fecha_termino', 'supervisor', 'contacto_supervisor']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'error': f'El campo {field} es requerido',
                    'status': 'error'
                }), 400
        
        try:
            fecha_inicio = datetime.strptime(data['fecha_inicio'], '%Y-%m-%d')
            fecha_termino = datetime.strptime(data['fecha_termino'], '%Y-%m-%d')
        except ValueError:
            return jsonify({
                'error': 'Formato de fecha inválido',
                'status': 'error'
            }), 400
            
        estudiante = Estudiante.query.get(data['estudiante_id'])
        if not estudiante:
            return jsonify({
                'error': 'El estudiante no existe',
                'status': 'error'
            }), 404
            
        practica_existente = Practica.query.filter_by(
            estudiante_id=data['estudiante_id'],
            tipo_practica='Inicial'
        ).first()
        
        if practica_existente:
            return jsonify({
                'error': 'El estudiante ya tiene una práctica inicial registrada',
                'status': 'error'
            }), 400

        nueva_practica = Practica(
            estudiante_id=data['estudiante_id'],
            tipo_practica='Inicial',
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

@practicas_bp.route('/practicas/profesional', methods=['GET'])
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

@practicas_bp.route('/practicas/profesional', methods=['POST'])
@jwt_required()
def crear_practica_profesional():
    try:
        data = request.get_json()
        
        required_fields = ['estudiante_id', 'empresa', 'fecha_inicio', 
                         'fecha_termino', 'supervisor', 'contacto_supervisor']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'error': f'El campo {field} es requerido',
                    'status': 'error'
                }), 400
        
        try:
            fecha_inicio = datetime.strptime(data['fecha_inicio'], '%Y-%m-%d')
            fecha_termino = datetime.strptime(data['fecha_termino'], '%Y-%m-%d')
        except ValueError:
            return jsonify({
                'error': 'Formato de fecha inválido',
                'status': 'error'
            }), 400
            
        estudiante = Estudiante.query.get(data['estudiante_id'])
        if not estudiante:
            return jsonify({
                'error': 'El estudiante no existe',
                'status': 'error'
            }), 404
            
        practica_existente = Practica.query.filter_by(
            estudiante_id=data['estudiante_id'],
            tipo_practica='Profesional'
        ).first()
        
        if practica_existente:
            return jsonify({
                'error': 'El estudiante ya tiene una práctica profesional registrada',
                'status': 'error'
            }), 400

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

@practicas_bp.route('/practicas/<int:id>', methods=['PUT'])
@jwt_required()
def actualizar_practica(id):
    try:
        practica = Practica.query.get_or_404(id)
        data = request.get_json()
        
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
        
        practica.supervisor = data.get('supervisor', practica.supervisor)
        practica.contacto_supervisor = data.get('contacto_supervisor', practica.contacto_supervisor)
        
        db.session.commit()
        return jsonify({
            'message': 'Práctica actualizada exitosamente',
            'status': 'success'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500

@practicas_bp.route('/practicas/<int:id>', methods=['DELETE'])
@jwt_required()
def eliminar_practica(id):
    try:
        practica = Practica.query.get_or_404(id)
        db.session.delete(practica)
        db.session.commit()
        
        return jsonify({
            'message': 'Práctica eliminada exitosamente',
            'status': 'success'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500